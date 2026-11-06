/* Shopora non-commerce compatibility layer.
   No Shopify requests, product catalog, cart, or checkout are used. */
(() => {
  const empty = async () => [];
  const nothing = async () => null;
  const noCount = async () => 0;
  const safeText = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const api = {
    getAllProducts: empty, getAvailableProducts: empty, getProductByHandle: nothing,
    getProductById: nothing, findProduct: nothing, getVariantById: nothing,
    getDefaultVariant: nothing, getAvailableVariants: empty, applyVariantToProduct: nothing,
    getShopifyCartId: () => null, saveShopifyCartId: () => {}, clearShopifyCartId: () => {},
    addProductToCart: nothing, getShopifyCart: nothing, getShopifyCartCount: noCount,
    updateShopifyCartCount: noCount, updateCartLine: nothing, removeCartLine: nothing,
    goToShopifyCheckout: nothing, getProductUrl: () => "#", getProductImage: () => "",
    formatProductPrice: () => "", formatPrice: () => "", escapeHtml: safeText
  };
  window.ShoporaProducts = api;
  window.Shopora = api;
})();
