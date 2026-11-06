/* Shopora storefront removal: keeps the visual identity, removes commerce UI. */
(() => {
  const storePages = new Set(["shop.html","trending.html","categories.html","cart.html","wishlist.html","product.html","checkout.html"]);
  const path = location.pathname.split("/").pop() || "index.html";
  const css = document.createElement("style");
  css.textContent = `
    .shopora-evolving{min-height:48vh;display:grid;place-items:center;padding:76px 22px;background:var(--ivory,#f7f4ee);color:var(--black,#111);text-align:center}
    .shopora-evolving-inner{max-width:760px;padding:56px 36px;background:#fff;border:1px solid rgba(17,17,17,.1);box-shadow:0 18px 50px rgba(17,17,17,.06)}
    .shopora-evolving .eyebrow{color:var(--gold,#c6a06a);font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:16px}
    .shopora-evolving h1{font-family:'Playfair Display',serif;font-size:clamp(34px,5vw,54px);line-height:1.12;margin:0 0 18px}
    .shopora-evolving p{max-width:590px;margin:0 auto 25px;color:#77736d;font-size:15px}
    .shopora-evolving a{display:inline-flex;padding:13px 25px;background:#111;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.5px}
    .shopora-evolving a:hover{background:#9c753e}
  `;
  document.head.appendChild(css);

  const isStorePage = storePages.has(path);
  const header = document.querySelector("header, .site-header");
  const footer = document.querySelector("footer");
  const navTargets = new Set(["shop.html","categories.html","trending.html","cart.html","wishlist.html","product.html","checkout.html"]);
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute("href") || "";
    const file = href.split("?")[0].split("#")[0].split("/").pop();
    if (navTargets.has(file)) {
      const navItem = a.closest("li");
      if (navItem) navItem.remove();
      else a.remove();
    }
  });
  document.querySelectorAll('a[href*="cart"],a[href*="wishlist"],.cart-icon,.wishlist-icon,.cart-link,.wishlist-link').forEach(el => el.remove());

  const panel = document.createElement("section");
  panel.className = "shopora-evolving";
  panel.innerHTML = '<div class="shopora-evolving-inner"><div class="eyebrow">A new chapter for Shopora</div><h1>Something new is taking shape.</h1><p>We are refreshing Shopora and moving beyond the online store. Our familiar look and helpful content are staying while we prepare what comes next.</p><a href="index.html">BACK TO HOME</a></div>';

  if (isStorePage) {
    const body = document.body;
    let node = header ? header.nextElementSibling : body.firstElementChild;
    while (node && node !== footer) {
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
    if (footer) footer.before(panel); else body.appendChild(panel);
  } else if (path === "index.html" || path === "") {
    document.querySelectorAll(".products-grid,.product-grid,#productGrid,#trendingGrid,.categories-grid").forEach(el => {
      const section = el.closest("section");
      if (section) section.remove(); else el.remove();
    });
    document.querySelectorAll("section").forEach(section => {
      const t = (section.innerText || "").toLowerCase();
      if (/secure checkout|shopify checkout|add to cart|delivery options shown at checkout|payment methods available at shopify checkout/.test(t)) section.remove();
    });
    const hero = document.querySelector(".hero");
    if (hero) {
      const h = hero.querySelector("h1");
      const p = hero.querySelector("p");
      if (h) h.textContent = "A thoughtful space for ideas, guides and what comes next.";
      if (p) p.textContent = "Shopora is evolving beyond online shopping. Explore practical articles, useful insights and updates from our next chapter.";
      hero.querySelectorAll("form,.hero-search,.floating-search").forEach(el => el.remove());
      hero.querySelectorAll('a[href*="shop"],a[href*="categories"],a[href*="trending"]').forEach(el => el.remove());
    }
    document.querySelectorAll('a[href*="shop.html"],a[href*="categories.html"],a[href*="trending.html"]').forEach(el => el.remove());
  }
})();
