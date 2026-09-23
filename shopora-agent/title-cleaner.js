export function cleanProductTitle(title) {
  if (!title) {
    return "";
  }

  let cleaned = String(title)
    .replace(/\s+/g, " ")
    .trim();

  const removePhrases = [
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
    "trending"
  ];

  for (const phrase of removePhrases) {
    const regex = new RegExp(
      `\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );

    cleaned = cleaned.replace(regex, "");
  }

  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/\s*[,|/:-]\s*$/g, "")
    .trim();

  const words = cleaned.split(" ");

  if (words.length > 12) {
    cleaned = words.slice(0, 12).join(" ");
  }

  return cleaned;
}
