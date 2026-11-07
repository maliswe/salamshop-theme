# SalamShop header and navigation — Task 03

## Architecture

`sections/header.liquid` remains the header section in the existing `header-group` section group. No template or layout changes are needed. The section supplies the announcement, responsive logo, desktop product search, account/cart links, native desktop disclosures and mobile navigation drawer.

`snippets/header-menu.liquid` recursively renders the selected Shopify menu for desktop, mobile and a native fallback. It supports Shopify's nested links (up to three levels). Every parent category has its own destination link at the start of its submenu; expanding a category never navigates away. Active leaf/parent destination links use `aria-current="page"`. IDs include the section, context and ancestor path so repeated menus do not collide.

`snippets/header-search.liquid` uses a standard GET form to `routes.search_url` with `q` and `type=product`. Mobile search links to that native search route. Search does not use predictive requests, a new API or a JavaScript framework. The account link appears only when customer accounts are enabled. Cart accessibility text includes the full server-rendered `cart.item_count`; the visible badge includes zero. No cart mutation or polling is added. Counts update on navigation or Shopify section replacement; a future AJAX cart must rerender the header or explicitly integrate its count updates.

`snippets/header-icon.liquid` contains only decorative utility icons. The existing account/cart SVG assets are reused with an explicit stroke-width token. No branding asset was generated or changed.

`assets/header.css` scopes presentation to the header and consumes the existing design tokens. Local header variables carry merchant logo widths. The header background follows `--color-surface`; frosted glass mixes that surface with transparency over a transparent section wrapper at all widths. The drawer backdrop derives from `--color-foreground`. Primary/secondary text, borders and focus states use the global tokens; the cart badge uses `--color-primary` / `--color-on-primary`, and active navigation uses `--color-primary-container` / `--color-on-primary-container`. There is no independent header color override, so global Theme Editor color changes flow through automatically. The section wrapper is sticky when enabled. Desktop navigation wraps rather than scrolling horizontally; its dropdown panels are anchored within the navigation width to avoid viewport-edge overflow. Nested disclosures remain in-flow within the panel. The mobile layout applies below 64rem, including tablets, with bounded logo width and 44px control targets. Logical CSS properties prepare the component for future RTL layouts; an Arabic rollout must also set the document direction and test translated content.

## Header refinement — Step 01

The badge previously relied on inline text flow, a minimum width and `line-height: 1.5`. It now uses grid centering, `line-height: 1`, equal 1.25rem minimum dimensions and nowrap text. One digit forms a circle; longer counts expand into a pill. Its absolute position remains anchored to `.header-cart`, and Shopify count rendering, AJAX updates and screen-reader labels are unchanged.

Glass uses 88% of the configured surface color with 18px blur and 120% saturation, including the WebKit property. Browsers without backdrop-filter retain the solid surface. Reduced-transparency preferences restore an opaque header and disable header/drawer backdrop blur. The bottom border uses the global border token; a restrained foreground-derived shadow is enabled only by the existing sticky setting. Existing rounded search, tonal active navigation, spacing and logo picker are preserved.

Local Shopify preview screenshots are in `design/header-refinement-step-01/`: 390px mobile, 768px tablet and 1440px desktop, each at the top and after scrolling. No horizontal overflow was observed at those widths. The real empty-cart badge measured 20 × 20px with grid centering. The sticky wrapper remained at top 0 after scrolling; the existing ResizeObserver continued to supply header-height scroll clearance. Desktop content visibly diffused behind the header.

Theme Check, existing header/cart/design-system validators, syntax checks for all asset JavaScript files and `git diff --check` passed. The temporary `badge-values.html` fixture contains 0, 1, 9, 10, 99+ and 1000 without changing cart/catalog data. Browser security rejected its data-URL navigation, so larger-value visual verification remains pending. Reduced-transparency and unsupported-filter paths were inspected in CSS but were not browser-emulated. No commit, push, publication or production/catalog changes were made.

`assets/header.js` registers one `salam-header` custom element. Its lifecycle attaches listeners once and aborts them on disconnection. Newly inserted Theme Editor header markup upgrades automatically after registration. Native menu/search/cart navigation remains independent of JavaScript. No production settings, product data, collections or homepage layout are changed.

## Theme Editor options

### Floating desktop navigation pill

At the existing 64rem breakpoint, `.header-menu-root` now sizes to its links and centers inside the navigation row. A fully rounded tonal surface derives from `--color-surface-secondary`, with 70% translucency, 12px backdrop blur and a restrained token-derived shadow where supported. The opaque fallback and reduced-transparency mode retain the configured tonal surface. No motion is introduced.

Top-level current-page links and active branch summaries use `--color-primary` / `--color-on-primary`, with 700 weight. Hover uses the existing primary-container pair; global keyboard focus rings remain visible. Menu data, the existing picker, `link.current` / `link.child_active`, `aria-current="page"` and disclosure behavior are unchanged. Items retain 44px minimum height; the outer pill adds 16px to the desktop navigation row overall. Wrapping and the existing drawer/dock breakpoint remain intact.

Before/after screenshots at 390, 768, 1440 and 1920px are in `design/navigation-pill/`, with geometry in `comparison-metrics.json`. The top header row measured identically before and after at every size; mobile/tablet header heights were unchanged and the desktop menu stayed hidden there. No horizontal overflow was observed. Keyboard focus was verified, and navigating from Home to Catalog moved the gold active pill and `aria-current` to Catalog. The original configured gold logo rendered unchanged. Theme Check, header/locale/design-system validation, all asset JavaScript syntax checks and whitespace checks passed. This redesign changes desktop-navigation CSS and this documentation only.

### Full-width header refinement

The visible content constraint was `.header-shell`: it used `--page-width` / `--page-margin` to cap and center both header rows. The outer glass already spanned the viewport. Header-specific CSS now explicitly gives the wrapper, glass and shell 100% inline width, no maximum width or inline margins, and square outer corners. The global section grid and homepage hero widths are unchanged.

The shell uses token-based horizontal padding: 16px below 48rem, 24px from 48rem, and a 32–48px clamp from 64rem. Desktop uses balanced side columns around centered search, with the configured logo width retained and actions aligned right. Mobile/tablet keep the hamburger followed by the left-aligned brand, with search/cart actions on the right. Navigation fills the padded shell beneath the main row; compact row spacing, glass, search tones and badge centering are unchanged.

Local preview checks at 390, 768, 1440 and 1920px found no horizontal overflow. Header and shell start at x=0 and span the available browser width excluding the scrollbar; the desktop hero remains 1200px wide. Screenshots are in `design/header-full-width/`, including sticky-scrolled glass at 1440px. Theme Check and existing header/cart/search/design-system validators passed, as did `git diff --check`. This refinement changes header CSS and documentation only; no publication or commit was initiated.

### Glass appearance refinement

The original glass pass had an 88%-opaque beige surface, matching the search fill and suppressing most background detail. Inspection of the live preview confirmed a transparent sticky wrapper at z-index 30, an inner backdrop-filter stacking context, no top border, and no opaque intermediate background. The desktop header measured about 125px (72px main row plus 52px navigation and the separator).

The refined header blends the configured warm-ivory background (80%) with the configured surface (20%), then uses that blend at 74% opacity with the same 18px blur and 130% saturation. Search retains an opaque beige surface with a faint token-derived inset edge. Main-row/search padding and navigation padding are reduced; 44px navigation targets and the existing active primary-container pill remain. The desktop header now measures about 109px; mobile/tablet remain about 65px. The bottom separator mixes the configured border at 35% opacity, and the sticky-only shadow uses 3% foreground. Browsers lacking either color mixing or backdrop filtering retain an opaque header; reduced-transparency preferences also restore an opaque header.

Initial and sticky-scrolled screenshots at 390, 768 and 1440px are in `design/header-glass-refinement/`. Each scrolled capture was checked with actual category images behind the header, with the wrapper at top 0 and no horizontal overflow. The initial view has uniform page background behind it, so little blur is visible there by design. Desktop predictive search returned eight suggestions for “hijab”; mobile search opened with visible focus, and the navigation dialog opened above the header and closed with Escape. Screenshots preserve the actual development-store menu and text logo fallback.

Compared with `design/reference/salamshop-approved-design.png`, the header now has a lighter ivory base, more distinct tonal search and closely connected rows. No separate updated merchant screenshot was attached to this request, so comparison against that image remains unavailable. Theme Check reported zero issues; header, cart, search and design-system validators, all asset JavaScript syntax checks and whitespace checks passed. Production/catalog data, logos and unrelated layouts were unchanged; no commit or publication was initiated.

Select the header under the header section group. The existing menu setting ID is retained. All new labels/help/default text have Swedish and English schema translations.

| Setting | Behavior/default |
| --- | --- |
| Meny / Menu | Select a Shopify menu; defaults to `main-menu` |
| Fast sidhuvud vid rullning | Sticky header on by default |
| Visa sökfunktion | Show desktop product search and mobile search access; on by default |
| Logotypens bredd på dator | 80–280px, default 180px |
| Logotypens bredd på mobil | 60–160px, default 100px; shrinks if space is tight |
| Mobilmenyns bredd | Compact (up to 24rem) or full width |
| Visa meddelande | Announcement off by default |
| Meddelandetext | Merchant text; initial localized default is “Välkommen till SalamShop” |
| Länk för meddelande | Optional destination; blank renders plain announcement text |
| Visa meddelande på mobil | On by default; effective when announcement is enabled |

The header can be removed/re-added through its preset, is limited to one instance, and is enabled only in header groups. Global colors, fonts, spacing and the original logo remain in Theme settings. Header colors are configured through those existing global color settings.

## Original logo

Upload the original, unchanged gold SalamShop logo under **Temainställningar → Varumärke → SalamShops originallogotyp**. This reuses Task 02's `settings.logo` picker. The image uses its original aspect ratio, responsive widths and eager loading; there is no crop, filter, recoloring, redraw or replacement asset. Alternative text uses the image's alt text, falling back to the shop name.

When the picker is empty, an accessible shop-name text link is shown as requested. This fallback is not a final production logo. No original logo exists in the repository or was selected in the observed development preview, so verification of the real gold asset remains a merchant task.

## Menu setup

In the development store's Shopify admin, open **Content → Menus** (Navigation in some admin layouts). Create or edit the main menu, then select it in the header settings. Links and titles always come from this menu; none of the proposed categories are hardcoded in the theme.

Suggested top-level labels:

- Bönemattor
- Damkläder
- Herrkläder
- Dofter och rökelse
- Koranen och bönetillbehör
- Hem och dekoration
- Personlig vård

Connect these entries to existing destinations as appropriate, and indent child entries to create nested categories. This task does not create, rename or reorganize collections. The observed development menu still contains Shopify's default Home/Catalog/Contact labels. Translate those merchant labels or replace that menu in the admin when ready. Theme locale files do not rewrite merchant navigation data.

For English and Arabic, translate menu titles, announcement content and logo alt text through the store's content translation workflow. Theme UI keys are in `header.*` in storefront locales and `header_settings.*` in schema locales. Existing account/search translations are reused.

## Mobile and keyboard behavior

With JavaScript, the hamburger opens a native modal `dialog`. It has a named menu heading and a visible icon-plus-text close control. Focus moves to that close control; the browser's modal dialog behavior contains focus and makes the background inert. The hamburger's `aria-expanded` reflects drawer state and its `aria-controls` points to the drawer.

Close the drawer with its close control, Escape, or a click on the backdrop. Focus returns to the hamburger. Escape within an expanded nested disclosure first closes that disclosure and focuses its summary; a subsequent Escape closes the drawer. Resizing across the 64rem breakpoint closes the drawer, clears desktop dropdowns and moves drawer focus to the visible brand link. Disconnecting a header closes any open modal and aborts its listeners.

Disclosure summaries work with Enter/Space and ordinary Tab navigation. Arrow Down opens a disclosure and focuses its first destination. Escape closes the nearest open disclosure and returns focus to its summary. Opening one sibling closes the other sibling; clicking or focusing outside the desktop dropdown closes it. These are navigation disclosures, not application menus, so `role="menu"` and menu-item arrow-key expectations are not added.

If JavaScript is disabled, fails to load, or modal dialogs are unsupported, a native mobile `details` navigation remains available. It is nonmodal and can be opened/closed from its summary. All native links/search submission continue to work. Desktop dropdowns also work through native `details`. No hover-only interactions or unnecessary animations are used.

## Validation and testing checklist

Run from the project root:

```powershell
shopify theme check --output json
git diff --check
node scripts/validate-locales.cjs
node scripts/validate-design-system.cjs
node scripts/validate-header.cjs
node --check assets/header.js
```

Results for this task:

- Theme Check passes with zero errors, warnings or informational issues; baseline also passed.
- Locale validation passes: 69 storefront keys and 101 schema keys per language, with matching keys/placeholders/HTML. This task adds 8 storefront and 19 schema keys, and updates the original-logo setting help text.
- Design-system settings, default contrast, token references and 13 template/group references pass.
- Header validation checks 11 setting IDs/defaults/ranges, logo/search contracts and controller behavior: repeated registration, repeated connection, listener cleanup/reconnection, open/close/cancel/backdrop handling, focus restoration, breakpoint closing, sibling disclosure closing, Escape/Arrow Down and outside click.
- Controller tests use event/element test doubles; they do not prove native focus trapping, CSS layout or real Shopify editor behavior.
- JavaScript syntax and Git whitespace checks pass.
- The desktop header was observed in the already-running development preview at `http://127.0.0.1:9292`: desktop search, account/cart (0), native menu labels and the no-logo fallback rendered.
- In the isolated browser session, submitting product search redirected to Shopify's storefront password gate. Authentication was not automated. End-to-end search and mobile browser verification remain pending.

Before approval for release:

1. Unlock the development storefront in the test browser and submit Swedish search terms; verify the result URL contains `q` and `type=product` and results/empty states render.
2. At 320, 390, 768, 1024 and wide desktop sizes, inspect the header with a long shop name, long translated menu titles and maximum logo widths. Test an empty menu, missing logo and search hidden.
3. Upload the original gold logo and verify its aspect ratio, sharpness, alt text and both width controls.
4. Create a three-level menu fixture in the development admin and verify parent destinations, nested disclosures, current-page states and long-title wrapping. Do not use production for this check.
5. Test mobile open/close, background inertness, Tab/Shift+Tab containment, Escape at each depth, backdrop closing, focus return, scroll lock and resize while open.
6. Verify empty and populated cart counts in a development session, without proceeding to checkout. Test account-enabled/disabled states.
7. In Theme Editor, change each setting and repeatedly reload/re-add the section while the drawer is open. Confirm no duplicate listeners, stale modal or lost page scrolling.
8. Toggle sticky/announcement settings, test mobile announcement visibility and optional link, check keyboard focus and 200% zoom, and test navigation with JavaScript disabled.

No deployment, publication or Git commit was initiated by the agent. The existing user-run development preview was used for observation. Predictive search and homepage redesign remain outside Task 03.

References: [Shopify section architecture](https://shopify.dev/docs/storefronts/themes/architecture/sections), [native dialog behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).
