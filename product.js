/* =========================================================
   SHOPORA MARKET STORE
   PRODUCT DETAIL CONTROLLER
   File: product.js
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     BASIC HELPERS
     ========================================================= */

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("product");
  }

  function getCart() {
    try {
      const cart = JSON.parse(
        localStorage.getItem("shoporaCart") || "[]"
      );

      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(
      "shoporaCart",
      JSON.stringify(cart)
    );

    updateCartCount();

    window.dispatchEvent(new Event("shoporaCartUpdated"));
  }

  function getWishlist() {
    try {
      const wishlist = JSON.parse(
        localStorage.getItem("shoporaWishlist") || "[]"
      );

      return Array.isArray(wishlist) ? wishlist : [];
    } catch (error) {
      return [];
    }
  }

  function saveWishlist(wishlist) {
    localStorage.setItem(
      "shoporaWishlist",
      JSON.stringify(wishlist)
    );

    window.dispatchEvent(new Event("shoporaWishlistUpdated"));
  }

  /* =========================================================
     CART COUNT
     ========================================================= */

  function updateCartCount() {
    const cart = getCart();

    const count = cart.reduce(function (total, item) {
      return total + (Number(item.quantity) || 0);
    }, 0);

    const cartCount = $("cartCount");

    if (cartCount) {
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? "" : "";
    }
  }

  /* =========================================================
     TOAST
     ========================================================= */

  function showToast(message) {
    let toast = $("shoporaToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "shoporaToast";

      toast.style.position = "fixed";
      toast.style.left = "50%";
      toast.style.bottom = "28px";
      toast.style.transform = "translateX(-50%) translateY(20px)";
      toast.style.background = "#111111";
      toast.style.color = "#ffffff";
      toast.style.padding = "13px 20px";
      toast.style.borderRadius = "999px";
      toast.style.fontSize = "14px";
      toast.style.fontWeight = "600";
      toast.style.zIndex = "99999";
      toast.style.opacity = "0";
      toast.style.pointerEvents = "none";
      toast.style.transition =
        "opacity .25s ease, transform .25s ease";

      document.body.appendChild(toast);
    }

    toast.textContent = message;

    requestAnimationFrame(function () {
      toast.style.opacity = "1";
      toast.style.transform =
        "translateX(-50%) translateY(0)";
    });

    clearTimeout(window.shoporaToastTimer);

    window.shoporaToastTimer = setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform =
        "translateX(-50%) translateY(20px)";
    }, 2600);
  }

  /* =========================================================
     LOAD PRODUCT
     ========================================================= */

  function loadProduct() {
    if (
      !window.ShoporaProducts ||
      typeof window.ShoporaProducts.getProduct !== "function"
    ) {
      console.error(
        "ShoporaProducts is not available. Make sure products.js loads before product.js."
      );
      return;
    }

    const productId = getProductIdFromURL();
    const product =
      window.ShoporaProducts.getProduct(productId);

    if (!product) {
      showProductNotFound();
      return;
    }

    renderProduct(product);
    setupQuantity(product);
    setupCart(product);
    setupWishlist(product);
    renderRelatedProducts(product);
    generateProductSchema(product);

    updateCartCount();
  }

  /* =========================================================
     RENDER PRODUCT
     ========================================================= */

  function renderProduct(product) {
    const image = $("productImage");
    const name = $("productName");
    const category = $("productCategory");
    const price = $("productPrice");
    const description = $("productDescription");
    const metaCategory = $("metaCategory");
    const breadcrumbName = $("breadcrumbName");
    const badge = $("productBadge");
    const availability = $("productAvailability");
    const seller = $("productSeller");

    if (image) {
      image.src = product.image;
      image.alt = product.name;
      image.loading = "eager";

      image.onerror = function () {
        image.style.opacity = "0.35";
      };
    }

    if (name) {
      name.textContent = product.name;
    }

    if (category) {
      category.textContent = product.category;
    }

    if (price) {
      price.textContent =
        window.ShoporaProducts.formatPrice(product.price);
    }

    if (description) {
      description.textContent = product.description;
    }

    if (metaCategory) {
      metaCategory.textContent = product.category;
    }

    if (breadcrumbName) {
      breadcrumbName.textContent = product.name;
    }

    if (badge) {
      if (product.badge) {
        badge.textContent = product.badge;
        badge.style.display = "";
      } else {
        badge.style.display = "none";
      }
    }

    if (availability) {
      if (Number(product.stock) > 0) {
        availability.textContent =
          "In stock • " + product.stock + " available";
      } else {
        availability.textContent = "Out of stock";
      }
    }

    if (seller) {
      seller.textContent =
        "Sold by " +
        (product.seller || "Shopora Market Store");
    }

    document.title =
      product.name +
      " | Shopora Market Store";

    const metaDescription =
      document.querySelector('meta[name="description"]');

    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        product.description +
          " Shop online at Shopora Market Store."
      );
    }
  }

  /* =========================================================
     PRODUCT NOT FOUND
     ========================================================= */

  function showProductNotFound() {
    const productName = $("productName");
    const productDescription = $("productDescription");
    const productPrice = $("productPrice");

    if (productName) {
      productName.textContent = "Product not found";
    }

    if (productDescription) {
      productDescription.textContent =
        "Sorry, this product could not be found.";
    }

    if (productPrice) {
      productPrice.textContent = "";
    }

    document.title =
      "Product Not Found | Shopora Market Store";
  }

  /* =========================================================
     QUANTITY
     ========================================================= */

  function setupQuantity(product) {
    const quantityValue = $("quantityValue");
    const increaseButton = $("increaseQuantity");
    const decreaseButton = $("decreaseQuantity");

    let quantity = 1;

    function renderQuantity() {
      if (quantityValue) {
        quantityValue.textContent = quantity;
      }
    }

    if (increaseButton) {
      increaseButton.addEventListener("click", function () {
        const stock = Number(product.stock) || 0;

        if (stock > 0 && quantity < stock) {
          quantity++;
          renderQuantity();
        }
      });
    }

    if (decreaseButton) {
      decreaseButton.addEventListener("click", function () {
        if (quantity > 1) {
          quantity--;
          renderQuantity();
        }
      });
    }

    renderQuantity();
  }

  function getSelectedQuantity() {
    const quantityValue = $("quantityValue");

    const quantity = Number(
      quantityValue ? quantityValue.textContent : 1
    );

    return Math.max(1, quantity || 1);
  }

  /* =========================================================
     ADD TO CART
     ========================================================= */

  function setupCart(product) {
    const addToCartButton = $("addToCart");

    if (!addToCartButton) return;

    addToCartButton.addEventListener("click", function () {
      if (!product.buyable) {
        showToast("This product is currently unavailable.");
        return;
      }

      const stock = Number(product.stock) || 0;

      if (stock <= 0) {
        showToast("This product is currently out of stock.");
        return;
      }

      const quantity = getSelectedQuantity();
      const cart = getCart();

      const existingIndex = cart.findIndex(function (item) {
        return String(item.id) === String(product.id);
      });

      if (existingIndex !== -1) {
        const existingQuantity =
          Number(cart[existingIndex].quantity) || 0;

        const newQuantity =
          existingQuantity + quantity;

        cart[existingIndex].quantity =
          Math.min(newQuantity, stock);

        cart[existingIndex].productId = product.id;
        cart[existingIndex].name = product.name;
        cart[existingIndex].price = Number(product.price);
        cart[existingIndex].image = product.image;
      } else {
        cart.push({
          id: product.id,
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image,
          quantity: Math.min(quantity, stock)
        });
      }

      saveCart(cart);

      showToast(
        product.name + " added to your cart."
      );
    });
  }

  /* =========================================================
     WISHLIST
     ========================================================= */

  function setupWishlist(product) {
    const wishlistButton = $("wishlistButton");

    if (!wishlistButton) return;

    updateWishlistButton(product);

    wishlistButton.addEventListener("click", function () {
      let wishlist = getWishlist();

      const productId = String(product.id);

      const exists = wishlist.some(function (id) {
        return String(id) === productId;
      });

      if (exists) {
        wishlist = wishlist.filter(function (id) {
          return String(id) !== productId;
        });

        showToast("Removed from wishlist.");
      } else {
        wishlist.push(product.id);
        showToast("Added to wishlist.");
      }

      saveWishlist(wishlist);
      updateWishlistButton(product);
    });
  }

  function updateWishlistButton(product) {
    const wishlistButton = $("wishlistButton");

    if (!wishlistButton) return;

    const wishlist = getWishlist();

    const exists = wishlist.some(function (id) {
      return String(id) === String(product.id);
    });

    wishlistButton.classList.toggle("active", exists);
    wishlistButton.setAttribute(
      "aria-pressed",
      exists ? "true" : "false"
    );

    const label =
      exists
        ? "Remove from wishlist"
        : "Add to wishlist";

    wishlistButton.setAttribute("aria-label", label);
    wishlistButton.setAttribute("title", label);

    const textElement =
      wishlistButton.querySelector("[data-wishlist-text]");

    if (textElement) {
      textElement.textContent =
        exists ? "Saved" : "Wishlist";
    }
  }

  /* =========================================================
     RELATED PRODUCTS
     ========================================================= */

  function renderRelatedProducts(product) {
    const container = $("relatedProducts");

    if (!container) return;

    const related =
      window.ShoporaProducts.getRelatedProducts(
        product.id,
        4
      );

    if (!related.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = related
      .map(function (item) {
        return createRelatedCard(item);
      })
      .join("");

    container
      .querySelectorAll("[data-add-product]")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          const id =
            button.getAttribute("data-add-product");

          const relatedProduct =
            window.ShoporaProducts.getProduct(id);

          if (relatedProduct) {
            addProductToCart(
              relatedProduct,
              1
            );
          }
        });
      });
  }

  function createRelatedCard(product) {
    const price =
      window.ShoporaProducts.formatPrice(
        product.price
      );

    return `
      <article class="product-card">
        <a
          href="product.html?product=${encodeURIComponent(product.id)}"
          class="product-card-image"
          aria-label="View ${escapeHTML(product.name)}"
        >
          <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
          >
          ${
            product.badge
              ? `<span class="product-badge">${escapeHTML(
                  product.badge
                )}</span>`
              : ""
          }
        </a>

        <div class="product-card-content">
          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <h3>
            <a href="product.html?product=${encodeURIComponent(
              product.id
            )}">
              ${escapeHTML(product.name)}
            </a>
          </h3>

          <div class="product-card-bottom">
            <strong>${price}</strong>
          </div>

          <div class="product-card-actions">
            <a
              href="product.html?product=${encodeURIComponent(
                product.id
              )}"
              class="view-product"
            >
              View Product
            </a>

            ${
              product.buyable
                ? `
                  <button
                    type="button"
                    class="add-to-cart"
                    data-add-product="${escapeHTML(
                      product.id
                    )}"
                  >
                    Add to Cart
                  </button>
                `
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  /* =========================================================
     ADD RELATED PRODUCT TO CART
     ========================================================= */

  function addProductToCart(product, quantity) {
    if (!product.buyable) {
      showToast("This product is currently unavailable.");
      return;
    }

    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      showToast("This product is currently out of stock.");
      return;
    }

    const cart = getCart();

    const existingIndex = cart.findIndex(function (item) {
      return String(item.id) === String(product.id);
    });

    if (existingIndex !== -1) {
      const currentQuantity =
        Number(cart[existingIndex].quantity) || 0;

      cart[existingIndex].quantity = Math.min(
        currentQuantity + quantity,
        stock
      );
    } else {
      cart.push({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image,
        quantity: Math.min(quantity, stock)
      });
    }

    saveCart(cart);

    showToast(
      product.name + " added to your cart."
    );
  }

  /* =========================================================
     PRODUCT JSON-LD
     ========================================================= */

  function generateProductSchema(product) {
    const oldSchema =
      document.getElementById(
        "shoporaProductSchema"
      );

    if (oldSchema) {
      oldSchema.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: [
        new URL(
          product.image,
          window.location.href
        ).href
      ],
      description: product.description,
      sku: product.sku,
      category: product.category,
      brand: {
        "@type": "Brand",
        name: "Shopora Market Store"
      },
      offers: {
        "@type": "Offer",
        url:
          window.location.origin +
          "/product.html?product=" +
          encodeURIComponent(product.id),
        priceCurrency: "PKR",
        price: String(product.price),
        availability:
          Number(product.stock) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name:
            product.seller ||
            "Shopora Market Store"
        }
      }
    };

    const script =
      document.createElement("script");

    script.type = "application/ld+json";
    script.id = "shoporaProductSchema";
    script.textContent =
      JSON.stringify(schema);

    document.head.appendChild(script);
  }

  /* =========================================================
     STORAGE SYNC
     ========================================================= */

  window.addEventListener("storage", function () {
    updateCartCount();
  });

  window.addEventListener(
    "shoporaCartUpdated",
    function () {
      updateCartCount();
    }
  );

  /* =========================================================
     INITIALIZE
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      loadProduct();
      updateCartCount();
    }
  );
})();
