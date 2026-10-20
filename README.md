# Shopora Market Store

**Live website:** https://shoporamarketstore.store/  
**Articles & Guides:** https://shoporamarketstore.store/shopping-guides.html  
**Repository:** https://github.com/mmuneebjutt099-prog/shoporamarketstore.store

Shopora Market Store is a GitHub Pages storefront and editorial website covering fashion, beauty, electronics, accessories, home and living, and everyday shopping. The project combines product discovery pages with practical shopping guides to help visitors compare products and make informed decisions.

## Website sections

- **Home:** brand introduction, featured products and selected editorial guides.
- **Shop and Categories:** browse products and product categories.
- **Trending:** discover products highlighted by the site's trending section.
- **Articles & Guides:** practical editorial content on product comparisons, sizing, compatibility, delivery, returns, privacy and website publishing.
- **About and Contact:** learn about the store and find its published contact options.
- **Policies:** review privacy, cookies, terms and return/refund information.

## Project structure

- `index.html` — homepage.
- `shop.html`, `categories.html`, `trending.html` — product discovery pages.
- `shopping-guides.html` — editorial index for the articles.
- `articles/` — individual article pages.
- `articles.js` — central article-card registry used by pages that render Shopora guide cards.
- `products.js` — central product/catalog and related storefront logic.
- `sitemap.xml` — public page URLs submitted to search engines.
- `robots.txt` — crawler access guidance.
- `ads.txt` — advertising seller declaration for the site's configured publisher account.
- `about.html`, `contact.html`, and policy pages — store information and visitor terms.

## Adding an article

1. Create a standalone HTML file in `articles/`.
2. Include a descriptive page title, a unique summary, a self-referencing canonical URL, mobile viewport metadata, useful headings, accessible image alt text and working links.
3. Write original, accurate material that answers a real reader question. Avoid copied text, repetitive filler, unsupported promises or publishing many near-identical pages.
4. Add one metadata object for the article to the `SHOPORA_ARTICLES` array in `articles.js`. Use the exact public URL, a distinct title and description, a category, reading-time estimate, image URL and meaningful alt text.
5. Add the canonical public URL to `sitemap.xml`.
6. Check the article in a browser on desktop and mobile. Test its navigation, images and internal links, then verify the live URL after GitHub Pages deploys.

The homepage intentionally displays a small selection of article cards. The full Articles & Guides page uses the central registry to display the available guides.

## Search and advertising readiness

The repository includes basic search-engine files and page metadata, but their presence does not guarantee indexing, ranking or advertising approval. Keep the sitemap aligned with published URLs; use Google Search Console to monitor crawling and indexing; verify that the live site and required policy/contact pages work; and maintain genuinely helpful, original content. AdSense decisions are made by Google and cannot be guaranteed by adding a specific number of articles or inserting code alone. Check the current official AdSense policies and your account's site status before requesting another review.

The `ads.txt` file is a plain-text advertising authorization file. Keep its contents consistent with the seller details supplied in the relevant advertising account. Do not place passwords, private API tokens, customer information or other secrets in this public repository.

## Deployment

This project is published through GitHub Pages on the custom domain above. Changes committed to the configured publishing branch are deployed by GitHub Pages; allow time for deployment and caching before judging the live version. Confirm important changes using the public URL rather than assuming that a successful commit means every cache has refreshed.

## Maintenance checklist

- [ ] Check the live site and navigation after significant changes.
- [ ] Keep product details, prices, stock and delivery/return information accurate.
- [ ] Test article links and image loading on mobile and desktop.
- [ ] Keep article registry, sitemap and actual published pages in sync.
- [ ] Review Search Console indexing reports and fix genuine crawl errors.
- [ ] Review privacy, cookie, terms and refund information when store operations change.
- [ ] Never promise AdSense approval, guaranteed search ranking or guaranteed delivery.

---

Shopora Market Store — practical product discovery and shopping information.
