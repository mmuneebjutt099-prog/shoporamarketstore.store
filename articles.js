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
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Customer reviewing an online purchase"
  },
  {
    "url": "/articles/fashion-size-and-material-guide.html",
    "category": "Fashion",
    "title": "Clothing Sizes, Fabrics and Accessories",
    "description": "Use measurements and material details to compare fashion products more confidently.",
    "cover": "FIT • FABRIC • DETAILS",
    "readTime": "7 min read",
    "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Shoppers comparing clothing in a fashion store"
  },
  {
    "url": "/articles/electronics-compatibility-checklist.html",
    "category": "Electronics",
    "title": "Electronics Compatibility Checklist",
    "description": "Match device models, connectors and power requirements before buying tech.",
    "cover": "MATCH THE SPECS",
    "readTime": "7 min read",
    "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Technology devices used for work and communication"
  },
  {
    "url": "/articles/beauty-product-buying-guide.html",
    "category": "Beauty",
    "title": "How to Compare Beauty Products",
    "description": "Review shade, ingredients, quantity and usage information before you choose.",
    "cover": "READ THE DETAILS",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Beauty and skincare products arranged on a vanity"
  },
  {
    "url": "/articles/home-living-measurement-guide.html",
    "category": "Home & living",
    "title": "Measure and Compare Home Products",
    "description": "Check dimensions, materials, care and package contents for home products.",
    "cover": "MEASURE FIRST",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Modern living room with carefully arranged furniture"
  },
  {
    "url": "/articles/how-to-compare-product-listings.html",
    "category": "Shopping basics",
    "title": "How to Compare Product Listings Before You Buy",
    "description": "Compare specifications, package contents, photos and full checkout costs before choosing between similar products.",
    "cover": "COMPARE THE DETAILS",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Product shown clearly for comparison"
  },
  {
    "url": "/articles/online-shopping-safety-and-privacy.html",
    "category": "Online shopping",
    "title": "Online Shopping Safety: Accounts, Payments and Personal Information",
    "description": "Practical checks for account security, genuine checkout pages and protecting personal information while shopping online.",
    "cover": "SHOP WITH CARE",
    "readTime": "7 min read",
    "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Secure online shopping and payment concept"
  },
  {
    "url": "/articles/understanding-shipping-delivery-and-returns.html",
    "category": "Orders & delivery",
    "title": "Shipping, Delivery and Returns: What to Check Before Ordering",
    "description": "Review delivery estimates, shipping charges, address accuracy, tracking and return conditions before checkout.",
    "cover": "PLAN THE DELIVERY",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Parcel prepared for shipping and delivery"
  },
  {
    "url": "/articles/how-to-read-product-reviews.html",
    "category": "Shopping basics",
    "title": "How to Read Product Reviews and Make a Balanced Choice",
    "description": "Evaluate review details, recurring themes, dates and product fit without treating star ratings as guarantees.",
    "cover": "READ BEYOND STARS",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Customer considering product information before purchase"
  },
  {
    "url": "/articles/choosing-everyday-bags-and-accessories.html",
    "category": "Fashion & accessories",
    "title": "Choosing Everyday Bags and Accessories: Size, Material and Use",
    "description": "Compare dimensions, capacity, closures, materials and care instructions before choosing everyday accessories.",
    "cover": "DETAILS THAT FIT",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Everyday handbag shown in a fashion setting"
  },
  {
    "url": "/articles/choosing-a-skincare-routine.html",
    "category": "Beauty",
    "title": "How to Compare Skincare Products for Your Routine",
    "description": "Compare ingredients, skin needs, product size and directions carefully before choosing skincare products for everyday use.",
    "cover": "SKINCARE, SIMPLIFIED",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1400&q=85",
    "imageAlt": "Skincare products arranged for comparison"
  },
  {
    "url": "/articles/home-storage-measurement-guide.html",
    "category": "Home & living",
    "title": "Measure First: Choosing Storage and Home Organisers",
    "description": "Measure available space and compare dimensions, materials, capacity and assembly details before buying home storage products.",
    "cover": "MEASURE YOUR SPACE",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85",
    "imageAlt": "Organised home interior with practical furniture"
  },
  {
    "url": "/articles/electronics-cable-and-charger-compatibility.html",
    "category": "Electronics",
    "title": "Chargers and Cables: Check Compatibility Before Buying",
    "description": "Match connector type, charging standards, power ratings and device requirements before choosing cables or chargers online.",
    "cover": "CHECK BEFORE CONNECTING",
    "readTime": "6 min read",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1400&q=85",
    "imageAlt": "Electronic accessories and charging equipment"
  },
  {
    "url": "/articles/practical-seo-guide-for-online-stores.html",
    "category": "SEO & website growth",
    "title": "A Practical SEO Guide for Online Stores",
    "description": "Improve search visibility with useful content, clear product pages, technical checks and a sustainable measurement routine.",
    "cover": "BUILD SEARCH VISIBILITY",
    "readTime": "9 min read",
    "image": "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Laptop and notebook used to plan website content"
  },
  {
    "url": "/articles/google-adsense-approval-checklist.html",
    "category": "Publishing & monetization",
    "title": "Google AdSense Approval Checklist",
    "description": "Prepare your website with original content, clear navigation, accurate policy pages and a correctly configured ads.txt file.",
    "cover": "PREPARE WITH CARE",
    "readTime": "10 min read",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Website analytics dashboard on a laptop screen"
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
    const image = escapeHtml(article.image || "");
    const imageAlt = escapeHtml(article.imageAlt || article.title);

    if (variant === "editorial") {
      return '<article class="editorial-card">' +
        '<div class="editorial-art" style="padding:0;min-height:0;background:#fff;color:#171614"><img src="' + image + '" alt="' + imageAlt + '" loading="lazy" width="1200" height="750" style="display:block;width:100%;aspect-ratio:16/10;object-fit:cover"><span style="display:block;padding:13px 20px 0;color:#8a6838">' + category + '</span><strong style="display:block;padding:5px 20px 16px;font-size:20px">' + cover + '</strong></div>' +
        '<div class="editorial-card-body"><div class="editorial-meta">' + readTime + ' · Shopora guide</div>' +
        '<h2><a href="' + url + '">' + title + '</a></h2><p>' + description + '</p>' +
        '<a class="editorial-read" href="' + url + '">READ ARTICLE ↗</a></div></article>';
    }

    return '<article class="shopora-article-card">' +
      '<div class="shopora-article-art" style="padding:0;min-height:0;background:#fff;color:#171614"><img src="' + image + '" alt="' + imageAlt + '" loading="lazy" width="1200" height="750" style="display:block;width:100%;aspect-ratio:16/10;object-fit:cover"><span style="display:block;padding:12px 19px 0;color:#8a6838">' + category + '</span><strong style="display:block;padding:4px 19px 14px;font-size:18px">' + cover + '</strong></div>' +
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