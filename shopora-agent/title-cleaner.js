const REMOVE_PHRASES = [
  "2025 new model",
  "2026 new model",
  "new model",
  "hot selling",
  "fashion women",
  "fashion men",
  "free shipping",
  "high quality",
  "new arrival",
  "best seller",
  "trending",
  "wholesale",
  "dropshipping"
];

export function cleanProductTitle(title) {
  if (!title) {
    return "";
  }

  let cleaned = String(title)
    .replace(/\s+/g, " ")
    .trim();

  for (const phrase of REMOVE_PHRASES) {
    const escapedPhrase = phrase.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    cleaned = cleaned.replace(
      new RegExp(`\\b${escapedPhrase}\\b`, "gi"),
      ""
    );
  }

  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/^[\s,|/:-]+|[\s,|/:-]+$/g, "")
    .trim();

  const words = cleaned
    .split(/\s+/)
    .filter(Boolean);

  if (words.length > 12) {
    cleaned = words.slice(0, 12).join(" ");
  }

  return cleaned;
}
