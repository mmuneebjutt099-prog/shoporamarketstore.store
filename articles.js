/* Shopora central editorial index.
   To publish a new article: create its HTML page under /articles/, then add one metadata object to SHOPORA_ARTICLES below.
   Article cards on Home, Shop, Categories, Trending and Shopping Guides read from this single list.
*/
(function () {
  "use strict";
  const SHOPORA_ARTICLES = [
  {
    "url": "/articles/online-shopping-checklist.html",
    "category": "Shopping basics",
    "title": "A Practical Online Shopping Checklist",
    "description": "Compare the exact item, selected variant, full cost and store terms before ordering.",
    "cover": "BUY WITH CLARITY",
    "readTime": "6 min read"
  },
  {
    "url": "/articles/fashion-size-and-material-guide.html",
    "category": "Fashion",
    "title": "Clothing Sizes, Fabrics and Accessories",
    "description": "Use measurements and material details to compare fashion products more confidently.",
    "cover": "FIT • FABRIC • DETAILS",
    "readTime": "7 min read"
  },
  {
    "url": "/articles/electronics-compatibility-checklist.html",
    "category": "Electronics",
    "title": "Electronics Compatibility Checklist",
    "description": "Match device models, connectors and power requirements before buying tech.",
    "cover": "MATCH THE SPECS",
    "readTime": "7 min read"
  },
  {
    "url": "/articles/beauty-product-buying-guide.html",
    "category": "Beauty",
    "title": "How to Compare Beauty Products",
    "description": "Review shade, ingredients, quantity and usage information before you choose.",
    "cover": "READ THE DETAILS",
    "readTime": "6 min read"
  },
  {
    "url": "/articles/home-living-measurement-guide.html",
    "category": "Home & living",
    "title": "Measure and Compare Home Products",
    "description": "Check dimensions, materials, care and package contents for home products.",
    "cover": "MEASURE FIRST",
    "readTime": "6 min read"
  }
];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function renderCard(article, variant) {
    const url = escapeHtml(article.url);
    const category = escapeHtml(article.category);
    const title = escapeHtml(article.title);
    const description = escapeHtml(article.description);
    const cover = escapeHtml(article.cover);
    const readTime = escapeHtml(article.readTime || "5 min read");

    if (variant === "editorial") {
      return '<article class="editorial-card">' +
        '<div class="editorial-art"><span>' + category + '</span><strong>' + cover + '</strong></div>' +
        '<div class="editorial-card-body"><div class="editorial-meta">' + readTime + ' · Shopora guide</div>' +
        '<h2><a href="' + url + '">' + title + '</a></h2><p>' + description + '</p>' +
        '<a class="editorial-read" href="' + url + '">READ ARTICLE ↗</a></div></article>';
    }

    return '<article class="shopora-article-card">' +
      '<div class="shopora-article-art"><span>' + category + '</span><strong>' + cover + '</strong></div>' +
      '<div class="shopora-article-body"><h3><a href="' + url + '">' + title + '</a></h3>' +
      '<p>' + description + '</p><a class="shopora-article-read" href="' + url + '">READ ARTICLE ↗</a></div></article>';
  }

  function renderAll() {
    document.querySelectorAll("[data-shopora-articles]").forEach(function (container) {
      const limitValue = container.getAttribute("data-limit") || "3";
      const limit = limitValue === "all" ? SHOPORA_ARTICLES.length : Math.max(0, Number(limitValue) || 3);
      const variant = container.getAttribute("data-card-variant") === "editorial" ? "editorial" : "compact";
      container.innerHTML = SHOPORA_ARTICLES.slice(0, limit).map(function (article) {
        return renderCard(article, variant);
      }).join("");
    });
  }

  window.ShoporaArticles = {
    all: function () { return SHOPORA_ARTICLES.slice(); },
    render: renderAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
})();