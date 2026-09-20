/* =========================================================
   SHOPORA MARKET STORE
   REAL SHOPIFY PRODUCT DETAIL CONTROLLER
   ========================================================= */
(function () {
  "use strict";

  const SHOPIFY_STORE_DOMAIN = "fsgigg-tp.myshopify.com";
  const SHOPIFY_STOREFRONT_TOKEN = "b00f8861faa3611c651415d574bf0095";
  const SHOPIFY_API_VERSION = "2026-07";
  const SHOPIFY_URL =
    "https://" + SHOPIFY_STORE_DOMAIN +
    "/api/" + SHOPIFY_API_VERSION + "/graphql.json";
  const CART_KEY = "shoporaShopifyCartId";

  function $(id){ return document.getElementById(id); }

  function escapeHTML(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function toast(message){
    let t=$("shoporaToast");
    if(!t){
      t=document.createElement("div");
      t.id="shoporaToast";
      t.style.cssText="position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#111;color:#fff;padding:13px 20px;border-radius:999px;font:600 14px Arial;z-index:99999;opacity:0;transition:.25s;pointer-events:none";
      document.body.appendChild(t);
    }
    t.textContent=message;
    requestAnimationFrame(()=>{t.style.opacity="1";t.style.transform="translateX(-50%) translateY(0)"});
    clearTimeout(window.shoporaToastTimer);
    window.shoporaToastTimer=setTimeout(()=>{t.style.opacity="0";t.style.transform="translateX(-50%) translateY(20px)"},2600);
  }

  async function shopify(query, variables={}){
    const response=await fetch(SHOPIFY_URL,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Shopify-Storefront-Access-Token":SHOPIFY_STOREFRONT_TOKEN
      },
      body:JSON.stringify({query,variables})
    });
    const json=await response.json();
    if(!response.ok) throw new Error("Shopify HTTP "+response.status);
    if(json.errors?.length) throw new Error(json.errors.map(e=>e.message).join(", "));
    return json.data;
  }

  function getParam(){
    const p=new URLSearchParams(location.search);
    return p.get("handle") || p.get("product") || "";
  }

  function getCartId(){ return localStorage.getItem(CART_KEY); }
  function saveCartId(id){ if(id) localStorage.setItem(CART_KEY,id); }

  async function getCart(id){
    if(!id) return null;
    const q=`query Cart($id:ID!){
      cart(id:$id){ id totalQuantity checkoutUrl }
    }`;
    const d=await shopify(q,{id});
    return d.cart;
  }

  async function createCart(variantId, quantity){
    const q=`mutation Create($lines:[CartLineInput!]!){
      cartCreate(input:{lines:$lines}){
        cart{id checkoutUrl totalQuantity}
        userErrors{field message}
      }
    }`;
    const d=await shopify(q,{lines:[{merchandiseId:variantId,quantity}]});
    if(d.cartCreate.userErrors?.length) throw new Error(d.cartCreate.userErrors.map(e=>e.message).join(", "));
    return d.cartCreate.cart;
  }

  async function addToCart(variantId, quantity){
    let cartId=getCartId();
    let cart=await getCart(cartId).catch(()=>null);

    if(!cart){
      cart=await createCart(variantId,quantity);
      saveCartId(cart.id);
      return cart;
    }

    const q=`mutation Add($cartId:ID!,$lines:[CartLineInput!]!){
      cartLinesAdd(cartId:$cartId,lines:$lines){
        cart{id checkoutUrl totalQuantity}
        userErrors{field message}
      }
    }`;
    const d=await shopify(q,{cartId,lines:[{merchandiseId:variantId,quantity}]});
    if(d.cartLinesAdd.userErrors?.length){
      throw new Error(d.cartLinesAdd.userErrors.map(e=>e.message).join(", "));
    }
    saveCartId(d.cartLinesAdd.cart.id);
    return d.cartLinesAdd.cart;
  }

  function updateCartCount(count){
    const el=$("cartCount");
    if(el && count != null) el.textContent=String(count);
  }

  async function loadProduct(){
    const handle=getParam();
    if(!handle) return showNotFound();

    const q=`query Product($handle:String!){
      productByHandle(handle:$handle){
        id title handle description
        featuredImage{url altText}
        priceRange{minVariantPrice{amount currencyCode}}
        variants(first:50){
          nodes{id title availableForSale price{amount currencyCode}}
        }
      }
    }`;

    try{
      const d=await shopify(q,{handle});
      const product=d.productByHandle;
      if(!product) return showNotFound();

      const variants=product.variants.nodes || [];
      const variant=variants.find(v=>v.availableForSale) || variants[0];
      if(!variant) return showNotFound();

      render(product,variant);
      setupQuantity();
      setupCart(product,variant);
      setupWishlist(product);
      loadRelated(product.id);
      updateCartFromShopify();
    }catch(error){
      console.error("Shopify product error:",error);
      showError(error.message);
    }
  }

  function render(product,variant){
    const image=$("productImage"), name=$("productName"), category=$("productCategory");
    const price=$("productPrice"), desc=$("productDescription"), meta=$("metaCategory");
    const crumb=$("breadcrumbName"), badge=$("productBadge"), avail=$("productAvailability");
    const seller=$("productSeller");

    if(image){ image.src=product.featuredImage?.url || "assets/shopora-mark.png"; image.alt=product.featuredImage?.altText || product.title; }
    if(name) name.textContent=product.title;
    if(category) category.textContent="Shopora Collection";
    if(price) price.textContent=formatMoney(variant.price.amount,variant.price.currencyCode);
    if(desc) desc.textContent=product.description || "Discover this product at Shopora Market Store.";
    if(meta) meta.textContent="Shopora Collection";
    if(crumb) crumb.textContent=product.title;
    if(badge){ badge.textContent="Shopify"; badge.style.display=""; }
    if(avail) avail.textContent=variant.availableForSale ? "In stock" : "Currently unavailable";
    if(seller) seller.textContent="Sold by Shopora Market Store";
    document.title=product.title+" | Shopora Market Store";
  }

  function formatMoney(amount,currency){
    try{
      return new Intl.NumberFormat("en-PK",{style:"currency",currency:currency||"PKR",maximumFractionDigits:0}).format(Number(amount));
    }catch(e){ return (currency||"PKR")+" "+Number(amount).toLocaleString(); }
  }

  function setupQuantity(){
    let quantity=1;
    const value=$("quantityValue");
    const plus=$("increaseQuantity"), minus=$("decreaseQuantity");
    if(plus) plus.onclick=()=>{quantity++; if(value)value.textContent=quantity;};
    if(minus) minus.onclick=()=>{if(quantity>1){quantity--;if(value)value.textContent=quantity;}};
    if(value)value.textContent="1";
  }

  function setupCart(product,variant){
    const btn=$("addToCart");
    if(!btn)return;
    btn.disabled=!variant.availableForSale;
    btn.textContent=variant.availableForSale ? "Add To Cart" : "Currently Unavailable";
    btn.onclick=async()=>{
      if(!variant.availableForSale){toast("This product is currently unavailable.");return;}
      const qty=Math.max(1,Number($("quantityValue")?.textContent||1));
      btn.disabled=true; btn.textContent="Adding...";
      try{
        const cart=await addToCart(variant.id,qty);
        updateCartCount(cart.totalQuantity);
        btn.textContent="Added ✓";
        toast(product.title+" added to your cart.");
        setTimeout(()=>{btn.disabled=false;btn.textContent="Add To Cart"},1200);
      }catch(e){
        console.error(e);
        btn.disabled=false; btn.textContent="Add To Cart";
        toast("Unable to add to Shopify cart.");
      }
    };
  }

  function setupWishlist(product){
    const btn=$("wishlistButton");
    if(!btn)return;
    let list=[];
    try{list=JSON.parse(localStorage.getItem("shoporaWishlist")||"[]")}catch(e){}
    const exists=list.includes(product.id);
    btn.classList.toggle("active",exists);
    btn.onclick=()=>{
      let l=[];
      try{l=JSON.parse(localStorage.getItem("shoporaWishlist")||"[]")}catch(e){}
      const i=l.indexOf(product.id);
      if(i>=0){l.splice(i,1);toast("Removed from wishlist.");}
      else{l.push(product.id);toast("Added to wishlist.");}
      localStorage.setItem("shoporaWishlist",JSON.stringify(l));
      btn.classList.toggle("active",i<0);
    };
  }

  async function updateCartFromShopify(){
    const cart=await getCart(getCartId()).catch(()=>null);
    if(cart) updateCartCount(cart.totalQuantity);
  }

  async function loadRelated(currentId){
    const box=$("relatedProducts");
    if(!box)return;
    try{
      const q=`query Related{products(first:5){nodes{id title handle featuredImage{url altText} priceRange{minVariantPrice{amount currencyCode}} variants(first:1){nodes{id availableForSale}}}}}`;
      const d=await shopify(q);
      const items=(d.products.nodes||[]).filter(p=>p.id!==currentId).slice(0,4);
      box.innerHTML=items.map(p=>{
        const v=p.variants.nodes[0];
        return `<article class="product-card">
          <a href="product.html?handle=${encodeURIComponent(p.handle)}" class="product-card-image">
            <img src="${escapeHTML(p.featuredImage?.url||"assets/shopora-mark.png")}" alt="${escapeHTML(p.title)}" loading="lazy">
          </a>
          <div class="product-card-content">
            <span class="product-category">Shopora Collection</span>
            <h3><a href="product.html?handle=${encodeURIComponent(p.handle)}">${escapeHTML(p.title)}</a></h3>
            <div class="product-card-bottom"><strong>${formatMoney(p.priceRange.minVariantPrice.amount,p.priceRange.minVariantPrice.currencyCode)}</strong></div>
            <div class="product-card-actions"><a href="product.html?handle=${encodeURIComponent(p.handle)}" class="view-product">View Product</a></div>
          </div>
        </article>`;
      }).join("");
    }catch(e){ console.warn("Related products:",e); }
  }

  function showNotFound(){
    if($("productName"))$("productName").textContent="Product not found";
    if($("productDescription"))$("productDescription").textContent="This Shopify product could not be found.";
    if($("addToCart")){$("addToCart").disabled=true;$("addToCart").textContent="Product Unavailable";}
  }

  function showError(message){
    if($("productName"))$("productName").textContent="Shopify product could not load";
    if($("productDescription"))$("productDescription").textContent="Please refresh the page and try again.";
    console.error(message);
  }

  document.addEventListener("DOMContentLoaded",loadProduct);
})();