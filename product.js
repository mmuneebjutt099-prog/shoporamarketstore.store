 /* =========================================================
    SHOPORA MARKET STORE
    product.js
    PRODUCT DETAIL PAGE CONTROLLER
    Uses central products.js system
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
    if (window.ShoporaProducts?.escapeHtml) {
      return window.ShoporaProducts.escapeHtml(value);
    }

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatMoney(amount, currency) {
    if (window.ShoporaProducts?.formatProductPrice) {
      return window.ShoporaProducts.formatProductPrice(
        amount,
        currency || "PKR"
      );
    }

    try {
      return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: currency || "PKR",
        maximumFractionDigits: 0
      }).format(Number(amount || 0));
    } catch (error) {
      return `${currency || "PKR"} ${Number(
        amount || 0
      ).toLocaleString()}`;
    }
  }


  /* =========================================================
     TOAST
     ========================================================= */

  function toast(message) {
    let t = $("shoporaToast");

    if (!t) {
      t = document.createElement("div");

      t.id = "shoporaToast";

      t.style.cssText = `
        position:fixed;
        left:50%;
        bottom:28px;
        transform:translateX(-50%) translateY(20px);
        background:#111;
        color:#fff;
        padding:13px 20px;
        border-radius:999px;
        font:600 14px Arial,sans-serif;
        z-index:99999;
        opacity:0;
        transition:.25s;
        pointer-events:none;
        box-shadow:0 10px 30px rgba(0,0,0,.18);
      `;

      document.body.appendChild(t);
    }

    t.textContent = message;

    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform =
        "translateX(-50%) translateY(0)";
    });

    clearTimeout(
      window.shoporaToastTimer
    );

    window.shoporaToastTimer =
      setTimeout(() => {
        t.style.opacity = "0";
        t.style.transform =
          "translateX(-50%) translateY(20px)";
      }, 2600);
  }


  /* =========================================================
     URL HANDLE
     ========================================================= */

  function getProductHandle() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("handle") ||
      params.get("product") ||
      ""
    );
  }


  /* =========================================================
     PAGE STATE
     ========================================================= */

  let currentProduct = null;
  let selectedVariant = null;
  let quantity = 1;


  /* =========================================================
     LOAD PRODUCT
     ========================================================= */

  async function loadProduct() {

    const handle =
      getProductHandle();

    if (!handle) {
      showNotFound();
      return;
    }

    if (!window.ShoporaProducts) {

      showError(
        "products.js is not loaded."
      );

      return;
    }

    try {

      const product =
        await window.ShoporaProducts
          .getProductByHandle(handle);

      if (!product) {
        showNotFound();
        return;
      }

      currentProduct = product;

      /*
        Default variant:
        first available Shopify variant.
      */

      selectedVariant =
        window.ShoporaProducts
          .getDefaultVariant(product);

      if (!selectedVariant) {
        showNotFound();
        return;
      }

      renderProduct();

      setupVariantSelector();

      setupQuantity();

      setupCart();

      setupWishlist();

      await loadRelatedProducts(
        product.id
      );

      await updateCartCount();

    } catch (error) {

      console.error(
        "Shopora product error:",
        error
      );

      showError(
        error.message
      );
    }
  }


  /* =========================================================
     RENDER PRODUCT
     ========================================================= */

  function renderProduct() {

    if (!currentProduct) {
      return;
    }

    const product =
      window.ShoporaProducts
        .applyVariantToProduct(
          currentProduct,
          selectedVariant.id
        );

    if (product) {
      currentProduct = product;
    }

    const image =
      $("productImage");

    const name =
      $("productName");

    const category =
      $("productCategory");

    const price =
      $("productPrice");

    const description =
      $("productDescription");

    const meta =
      $("metaCategory");

    const breadcrumb =
      $("breadcrumbName");

    const badge =
      $("productBadge");

    const availability =
      $("productAvailability");

    const seller =
      $("productSeller");


    /* =====================================================
       IMAGE
       ===================================================== */

    if (image) {

      image.src =
        currentProduct.image ||
        currentProduct.featuredImage?.url ||
        "assets/shopora-mark.png";

      image.alt =
        currentProduct
          .variant
          ?.image
          ?.altText ||
        currentProduct.featuredImage
          ?.altText ||
        currentProduct.title;
    }


    /* =====================================================
       TITLE
       ===================================================== */

    if (name) {
      name.textContent =
        currentProduct.title;
    }


    /* =====================================================
       CATEGORY
       ===================================================== */

    if (category) {
      category.textContent =
        currentProduct.productType ||
        "Shopora Collection";
    }

    if (meta) {
      meta.textContent =
        currentProduct.productType ||
        "Shopora Collection";
    }


    /* =====================================================
       PRICE
       ===================================================== */

    if (price) {

      price.textContent =
        formatMoney(
          selectedVariant.price.amount,
          selectedVariant.price.currencyCode
        );
    }


    /* =====================================================
       DESCRIPTION
       ===================================================== */

    if (description) {

      description.textContent =
        currentProduct.description ||
        "Discover this product at Shopora Market Store.";
    }


    /* =====================================================
       BREADCRUMB
       ===================================================== */

    if (breadcrumb) {
      breadcrumb.textContent =
        currentProduct.title;
    }


    /* =====================================================
       BADGE
       ===================================================== */

    if (badge) {
      badge.textContent =
        "Shopify";

      badge.style.display =
        "";
    }


    /* =====================================================
       AVAILABILITY
       ===================================================== */

    if (availability) {

      if (
        selectedVariant.availableForSale
      ) {

        availability.textContent =
          "In stock";

      } else {

        availability.textContent =
          "Currently unavailable";
      }
    }


    /* =====================================================
       SELLER
       ===================================================== */

    if (seller) {

      seller.textContent =
        currentProduct.vendor ||
        "Sold by Shopora Market Store";
    }


    /* =====================================================
       DOCUMENT TITLE
       ===================================================== */

    document.title =
      `${currentProduct.title} | Shopora Market Store`;
  }


  /* =========================================================
     VARIANT SELECTOR
     ========================================================= */

  function setupVariantSelector() {

    if (!currentProduct) {
      return;
    }

    /*
      Remove previously created selector.
    */

    const old =
      document.getElementById(
        "shoporaVariantSelector"
      );

    if (old) {
      old.remove();
    }


    const variants =
      currentProduct.variants || [];

    if (!variants.length) {
      return;
    }


    /*
      Find a sensible place in existing product page.

      We do NOT rebuild the design.
      We simply insert the variant selector
      before quantity/add-to-cart area.
    */

    const addButton =
      $("addToCart");

    const quantityArea =
      $("quantityValue")?.closest(
        ".quantity-selector, .quantity-control, .quantity, .product-quantity"
      );


    const wrapper =
      document.createElement("div");

    wrapper.id =
      "shoporaVariantSelector";

    wrapper.style.cssText = `
      margin:18px 0;
    `;


    const title =
      document.createElement("div");

    title.textContent =
      "Color";

    title.style.cssText = `
      font-weight:600;
      margin-bottom:10px;
      font-size:14px;
    `;

    wrapper.appendChild(title);


    const options =
      document.createElement("div");

    options.style.cssText = `
      display:flex;
      flex-wrap:wrap;
      gap:8px;
    `;


    variants.forEach(
      variant => {

        const button =
          document.createElement("button");

        button.type =
          "button";

        button.dataset.variantId =
          variant.id;

        button.textContent =
          variant.title;

        const active =
          selectedVariant.id ===
          variant.id;

        button.style.cssText = `
          border:1px solid ${
            active
              ? "#111"
              : "#d8d3ca"
          };
          background:${
            active
              ? "#111"
              : "#fff"
          };
          color:${
            active
              ? "#fff"
              : "#111"
          };
          border-radius:999px;
          padding:9px 14px;
          font:500 13px Arial,sans-serif;
          cursor:${
            variant.availableForSale
              ? "pointer"
              : "not-allowed"
          };
          opacity:${
            variant.availableForSale
              ? "1"
              : ".45"
          };
          transition:.2s;
        `;


        button.disabled =
          !variant.availableForSale;


        button.addEventListener(
          "click",
          () => {

            selectVariant(
              variant.id
            );

          }
        );


        options.appendChild(
          button
        );
      }
    );


    wrapper.appendChild(
      options
    );


    /*
      Insert before quantity if possible.
    */

    if (quantityArea) {

      quantityArea.parentNode.insertBefore(
        wrapper,
        quantityArea
      );

    } else if (addButton) {

      addButton.parentNode.insertBefore(
        wrapper,
        addButton
      );

    }
  }


  /* =========================================================
     SELECT VARIANT
     ========================================================= */

  function selectVariant(
    variantId
  ) {

    if (!currentProduct) {
      return;
    }

    const variant =
      window.ShoporaProducts
        .getVariantById(
          currentProduct,
          variantId
        );

    if (!variant) {
      return;
    }

    selectedVariant =
      variant;


    /*
      Apply selected variant to
      product object.
    */

    currentProduct =
      window.ShoporaProducts
        .applyVariantToProduct(
          currentProduct,
          variant.id
        );


    renderProduct();

    setupVariantButtons();

    updateAddToCartButton();
  }


  /* =========================================================
     UPDATE VARIANT BUTTONS
     ========================================================= */

  function setupVariantButtons() {

    const selector =
      $("shoporaVariantSelector");

    if (!selector) {
      return;
    }

    selector
      .querySelectorAll(
        "button[data-variant-id]"
      )
      .forEach(button => {

        const active =
          button.dataset.variantId ===
          selectedVariant.id;

        const available =
          !button.disabled;


        button.style.background =
          active
            ? "#111"
            : "#fff";

        button.style.color =
          active
            ? "#fff"
            : "#111";

        button.style.borderColor =
          active
            ? "#111"
            : "#d8d3ca";

        button.style.opacity =
          available
            ? "1"
            : ".45";
      });
  }


  /* =========================================================
     UPDATE ADD TO CART BUTTON
     ========================================================= */

  function updateAddToCartButton() {

    const button =
      $("addToCart");

    if (!button) {
      return;
    }

    const available =
      Boolean(
        selectedVariant &&
        selectedVariant.availableForSale
      );

    button.disabled =
      !available;

    button.textContent =
      available
        ? "Add To Cart"
        : "Currently Unavailable";
  }


  /* =========================================================
     QUANTITY
     ========================================================= */

  function setupQuantity() {

    quantity = 1;

    const value =
      $("quantityValue");

    const plus =
      $("increaseQuantity");

    const minus =
      $("decreaseQuantity");


    if (value) {
      value.textContent =
        "1";
    }


    if (plus) {

      plus.onclick =
        () => {

          quantity++;

          if (value) {
            value.textContent =
              String(quantity);
          }
        };
    }


    if (minus) {

      minus.onclick =
        () => {

          if (quantity > 1) {
            quantity--;
          }

          if (value) {
            value.textContent =
              String(quantity);
          }
        };
    }
  }


  /* =========================================================
     ADD TO CART
     ========================================================= */

  function setupCart() {

    const button =
      $("addToCart");

    if (!button) {
      return;
    }


    updateAddToCartButton();


    button.onclick =
      async () => {

        if (!selectedVariant) {

          toast(
            "Please select a product variant."
          );

          return;
        }


        if (
          !selectedVariant.availableForSale
        ) {

          toast(
            "This variant is currently unavailable."
          );

          return;
        }


        const qty =
          Math.max(
            1,
            Number(
              $("quantityValue")
                ?.textContent ||
              quantity ||
              1
            )
          );


        button.disabled =
          true;

        button.textContent =
          "Adding...";


        try {

          /*
            IMPORTANT:
            Use central products.js.
            Selected variant ID goes directly
            into Shopify cart.
          */

          const cart =
            await window.ShoporaProducts
              .addProductToCart(
                currentProduct,
                qty,
                selectedVariant.id
              );


          await updateCartCount(
            cart?.totalQuantity
          );


          button.textContent =
            "Added ✓";


          toast(
            `${currentProduct.title} added to your cart.`
          );


          setTimeout(
            () => {

              updateAddToCartButton();

            },
            1200
          );


        } catch (error) {

          console.error(
            "Add to cart error:",
            error
          );


          toast(
            error.message ||
            "Unable to add product to cart."
          );


          updateAddToCartButton();
        }
      };
  }


  /* =========================================================
     CART COUNT
     ========================================================= */

  async function updateCartCount(
    knownCount = null
  ) {

    try {

      if (
        knownCount !== null &&
        knownCount !== undefined
      ) {

        const selectors = [
          "#cartCount",
          ".cart-count",
          "[data-cart-count]",
          ".cart-badge"
        ];

        selectors.forEach(
          selector => {

            document
              .querySelectorAll(
                selector
              )
              .forEach(
                element => {

                  element.textContent =
                    String(knownCount);

                }
              );
          }
        );

        return knownCount;
      }


      return await window
        .ShoporaProducts
        .updateShopifyCartCount();

    } catch (error) {

      console.warn(
        "Cart count update failed:",
        error
      );

      return 0;
    }
  }


  /* =========================================================
     WISHLIST
     ========================================================= */

  function setupWishlist(
    product
  ) {

    const button =
      $("wishlistButton");

    if (!button) {
      return;
    }


    let list = [];

    try {

      list =
        JSON.parse(
          localStorage.getItem(
            "shoporaWishlist"
          ) || "[]"
        );

    } catch {
      list = [];
    }


    const exists =
      list.includes(
        product.id
      );


    button.classList.toggle(
      "active",
      exists
    );


    button.onclick =
      () => {

        let wishlist = [];

        try {

          wishlist =
            JSON.parse(
              localStorage.getItem(
                "shoporaWishlist"
              ) || "[]"
            );

        } catch {

          wishlist = [];
        }


        const index =
          wishlist.indexOf(
            product.id
          );


        if (index >= 0) {

          wishlist.splice(
            index,
            1
          );

          toast(
            "Removed from wishlist."
          );

          button.classList.remove(
            "active"
          );

        } else {

          wishlist.push(
            product.id
          );

          toast(
            "Added to wishlist."
          );

          button.classList.add(
            "active"
          );
        }


        localStorage.setItem(
          "shoporaWishlist",
          JSON.stringify(
            wishlist
          )
        );
      };
  }


  /* =========================================================
     RELATED PRODUCTS
     ========================================================= */

  async function loadRelatedProducts(
    currentId
  ) {

    const box =
      $("relatedProducts");

    if (!box) {
      return;
    }


    try {

      const products =
        await window.ShoporaProducts
          .getAvailableProducts({
            first: 50
          });


      const items =
        products
          .filter(
            product =>
              product.id !== currentId
          )
          .slice(0, 4);


      if (!items.length) {

        box.innerHTML = "";

        return;
      }


      box.innerHTML =
        items
          .map(
            product => {

              const image =
                window.ShoporaProducts
                  .getProductImage(
                    product
                  );


              const url =
                window.ShoporaProducts
                  .getProductUrl(
                    product
                  );


              return `
                <article class="product-card">

                  <a
                    href="${escapeHTML(url)}"
                    class="product-card-image"
                  >
                    <img
                      src="${escapeHTML(
                        image ||
                        "assets/shopora-mark.png"
                      )}"
                      alt="${escapeHTML(
                        product.title
                      )}"
                      loading="lazy"
                    >
                  </a>

                  <div class="product-card-content">

                    <span class="product-category">
                      ${
                        escapeHTML(
                          product.productType ||
                          "Shopora Collection"
                        )
                      }
                    </span>

                    <h3>
                      <a
                        href="${escapeHTML(url)}"
                      >
                        ${escapeHTML(
                          product.title
                        )}
                      </a>
                    </h3>

                    <div class="product-card-bottom">

                      <strong>
                        ${escapeHTML(
                          product.formattedPrice
                        )}
                      </strong>

                    </div>

                    <div class="product-card-actions">

                      <a
                        href="${escapeHTML(url)}"
                        class="view-product"
                      >
                        View Product
                      </a>

                    </div>

                  </div>

                </article>
              `;
            }
          )
          .join("");


    } catch (error) {

      console.warn(
        "Related products failed:",
        error
      );
    }
  }


  /* =========================================================
     NOT FOUND
     ========================================================= */

  function showNotFound() {

    if ($("productName")) {

      $("productName").textContent =
        "Product not found";
    }


    if ($("productDescription")) {

      $("productDescription").textContent =
        "This Shopify product could not be found.";
    }


    if ($("addToCart")) {

      $("addToCart").disabled =
        true;

      $("addToCart").textContent =
        "Product Unavailable";
    }
  }


  /* =========================================================
     ERROR
     ========================================================= */

  function showError(
    message
  ) {

    if ($("productName")) {

      $("productName").textContent =
        "Shopify product could not load";
    }


    if ($("productDescription")) {

      $("productDescription").textContent =
        "Please refresh the page and try again.";
    }


    console.error(
      "Shopora product error:",
      message
    );
  }


  /* =========================================================
     START
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    loadProduct
  );

})();
