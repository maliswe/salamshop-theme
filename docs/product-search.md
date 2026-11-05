# Product search and discovery — Task 04

## Architecture and changed files

The existing header, navigation, announcement, original logo and cart remain intact. The header has one search form: desktop displays it in the top row; on mobile the existing search icon progressively opens that same form in an in-flow panel. There is no second modal and no duplicate desktop/mobile form. The icon still links to native search when JavaScript is unavailable.

The results page has its own independent instance with a unique section-based ID. It remains editable through the existing `templates/search.json` / `sections/search.liquid` structure; the JSON template is unchanged.

| File | Change |
| --- | --- |
| `assets/product-search.js` | Reusable `salam-search` custom element, URL helper and narrowed HTML renderer |
| `assets/product-search.css` | Suggestion rows, popup, feedback and responsive result cards |
| `sections/predictive-search.liquid` | Section-rendered Shopify product, collection and query suggestions |
| `snippets/search-product.liquid` | Shared image/title/price/availability output for suggestions and results |
| `snippets/header-search.liquid` | Existing native form wrapped in the reusable component |
| `sections/search.liquid` | Query heading, real result cards, empty state and native pagination |
| `sections/header.liquid` | Existing form becomes the mobile search panel; contextual close label |
| `assets/header.js` | Mobile panel focus, close/resize handling and navigation/search coordination |
| `assets/header.css` | Mobile panel placement and close-control visibility |
| `config/settings_schema.json` | Six global product-search settings |
| `locales/sv.default.json`, `locales/en.json` | 17 synchronized customer-facing translations |
| `locales/sv.default.schema.json`, `locales/en.schema.json` | Nine synchronized schema translations |
| `scripts/validate-search.cjs` | Search structure, URL, controller and rendering-safety checks |
| `scripts/validate-header.cjs` | Existing tests retained; adds mobile search/navigation coordination |
| `scripts/validate-design-system.cjs` | Checks consumption of new global settings outside the CSS token snippet |
| `docs/product-search.md` | This guide and verification record |

There are no new dependencies, private credentials, custom search backend, catalog edits or production changes. The initial working tree was clean; no reset, commit, deployment or publication command was run. Browser checks used the existing user-run development preview.

## Native endpoints and returned content

All routes come from Shopify Liquid:

- Suggestions: `routes.predictive_search_url`, with `q`, `resources[type]`, `resources[limit]`, `resources[limit_scope]=all` and `section_id=predictive-search`.
- Full results: `routes.search_url`, submitted with `method="get"`, `q` and `type=product`.
- Suggestion links retain Shopify's returned product/variant, collection and query URLs, including tracking parameters.

The request URL uses `URL`/`URLSearchParams`, preserving the locale prefix and encoding Swedish characters and reserved characters. Products are always requested. Collections and query resources are included only when enabled. The default is eight suggestions **in total**, not eight of each type; merchants can select four through ten, within Shopify's API limit. The View all results link is an additional action, not a suggestion.

`predictive_search.resources.products`, `.collections` and `.queries` supply all suggestions. No product name, price, ID, image or result is hardcoded. Query text is escaped rather than injecting the API's styled HTML. The Bönemattor, Sedef Hijab, Islamisk mössa and Imarat Thobe searches are verification cases only.

Product rows use Shopify media objects and money filters. A missing image gets a neutral decorative tile; no fake product image is substituted. Variable product prices are prefixed with “Från”. Compare-at prices appear only when greater than the current price and neither price varies across the product, avoiding a misleading comparison across different variants. “Slutsåld” depends on the whole product's `available` state. Returned product URLs are used unchanged so a matching variant destination is preserved when Shopify supplies it.

The full page renders `search.results`, including product cards and genuine page/article results if the URL requests those types. It paginates by 20 using Shopify's `paginate` object and localized native pagination. An empty state repeats the query, offers a suggestion to try another term, and retains its search form. Search submitted from this theme's forms is product-only.

## Theme Editor configuration

Under **Temainställningar → Produktsökning**:

| Setting | Default / effect |
| --- | --- |
| Aktivera sökförslag | On; disabling leaves normal search and mobile access working |
| Visa produktbilder | On; controls suggestion and full-result product images |
| Visa produktpriser | On; controls suggestion and full-result product prices |
| Visa kollektionsförslag | On; requests/renders collection suggestions |
| Visa sökordsförslag | On; requests/renders query suggestions |
| Högsta antal sökförslag | Eight total, adjustable from four to ten |

The existing header **Visa sökfunktion** setting still controls header search visibility. No duplicate visibility setting was introduced. Global surface, text, border, spacing, radius, button and focus tokens are reused. No merchant setup is required for the defaults beyond having searchable products on the development storefront. Relevance, synonyms and availability of returned suggestions belong to Shopify and its Search & Discovery settings.

## JavaScript and graceful degradation

The controller debounces input by 275ms. Empty/whitespace queries and composing IME input do not trigger requests; completed composition can trigger a request. Each query change invalidates the old timer, aborts its fetch and increments a request version. Both successful and failed stale requests are ignored. Closing, clearing, leaving the component, submitting, closing the mobile panel or disconnecting also invalidates pending work.

The component reads Shopify's `shopify-features` metadata. An explicit unsupported-language flag disables predictive enhancement. A failed request, non-success HTTP status, redirect, missing predictive fragment (including password HTML) or invalid result payload produces localized feedback while retaining the native search form. The theme never invents results. No retry loop, polling or cache of customer queries is added.

Shopify HTML is parsed into an inert document. Only the marked predictive fragment is accepted; a small element/attribute allowlist removes scripts, event attributes and unrelated markup. Link URLs must be HTTP(S) on the current origin, and unsafe image URL schemes are rejected. Approved nodes are imported with DOM APIs rather than assigning arbitrary HTML to `innerHTML`. Merchant text is escaped in Liquid.

Custom-element registration is guarded. Every instance owns its timers, request and abortable listeners. Disconnection cleans them up; fresh Theme Editor markup upgrades automatically. The header uses its existing lifecycle and closes search when opening navigation, and navigation when opening search. At the desktop breakpoint it closes the mobile presentation. The original navigation drawer's modal behavior is retained.

## Accessibility and responsive behavior

With predictive search enabled, the labeled input becomes a `combobox` with `aria-haspopup="dialog"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`. The suggestion popup is a **nonmodal dialog with ordinary links**, not a listbox containing nested interactive elements. No `option`/`listbox` roles or fake `aria-selected` states are mixed into this pattern.

- Arrow Down from the input focuses the first result link; Arrow Up focuses the last. Arrow keys move between links and back to the input at the ends.
- Enter on a link uses native link activation. Enter on the input and the submit button use native form submission.
- Tab/Shift+Tab use normal document focus order. Moving focus to another element outside the component closes suggestions; transient null focus transitions do not remove links before activation.
- Escape first closes pending/open suggestions, preserves the query and returns focus to the input. A second Escape can close the mobile panel and return focus to its trigger.
- Separate, contextually named controls close suggestions or the mobile panel. Clear explicitly empties the input; closing does not.
- A polite, atomic status region announces loading, actual result count, empty results or a localized error. Busy state is confined to results, so it does not suppress loading announcements.

The mobile trigger is enhanced to button semantics with Enter/Space support, and focuses the existing input. The mobile input spans its form row, while action buttons wrap below it. Suggestions stay in-flow in a bounded, scrollable header panel with dynamic viewport units. Desktop suggestions sit below the field, grow naturally up to a viewport-related maximum, and scroll when necessary so all results and View all remain reachable. This maximum is intentional for long titles or ten-result configurations. No horizontal overflow or new animation is introduced by the search component.

## Automated validation

```powershell
shopify theme check --output json
node scripts/validate-locales.cjs
node scripts/validate-design-system.cjs
node scripts/validate-header.cjs
node scripts/validate-search.cjs
node --check assets/header.js
node --check assets/product-search.js
git diff --check
```

All commands pass. Theme Check reports zero errors, warnings and informational issues. Locales contain 86 storefront and 110 schema keys per language with matching structures/placeholders. The design suite validates 26 global settings and 13 template/group references. Header regression tests pass.

The new suite tests source/configuration relationships, locale-aware URLs, query encoding, resource types/limits, 275ms debounce, abort/version races, empty inputs, network/HTTP/password/redirect handling, keyboard focus/native Enter, clear/dismiss behavior, reconnect cleanup, simultaneous independent instances, unsupported-language flags and markup filtering. It uses controlled timers, HTTP promises and DOM/event test doubles; it does not claim to replace real browser, Shopify editor or assistive-technology testing.

## Browser verification completed

The existing development preview at `http://127.0.0.1:9292/` was accessible during Task 04. Unlike the earlier Task 03 session, no storefront password blocker prevented the core tests in this session.

- Desktop at 1280px: real product suggestions, thumbnails, prices, valid compare-at prices, original logo and unchanged account/cart/navigation observed.
- “Sedef Hijab” returned that actual product; “Islamisk mössa” returned the actual mössa product. Arrow Down focused the first link and Enter opened the corresponding product page.
- “Imarat Thobe II” returned the actual product in the mobile panel. At 390px and 320px the input received focus and the header had no horizontal overflow.
- Mobile Escape closed suggestions and then the panel. The query was retained after closing suggestions.
- “Bönemattor” returned real products and the Bönemattor collection group. View all/native submission reached the full results URL with the encoded Swedish query and product type; 17 real results and sold-out badges were observed.
- A deliberately unmatched term produced no predictive suggestions, then a genuine empty full-results page with its search form and Swedish retry text.
- The results page contained two search instances with distinct input IDs. Browser console inspection reported no errors/warnings during the checked result-page flow.
- Screenshots were saved outside the theme repository in the Codex visualization workspace. Temporary responsive viewport overrides were reset.

No cart, account, catalog or checkout mutations were performed during browser testing. Cookie consent overlays were dismissed for inspection.

## Remaining manual checks and known limitations

Before release:

1. In the development Theme Editor, toggle all six settings and header visibility. Reload/re-add the header and search section repeatedly while requests are pending; verify no duplicate listeners or stale suggestions.
2. Test actual screen-reader speech with NVDA/VoiceOver and a physical mobile keyboard open. Browser accessibility snapshots and viewport resizing verified structure/layout, not assistive-technology speech or a real virtual keyboard.
3. Verify query suggestions when Shopify returns them; none appeared for the recorded catalog queries. They are not fabricated when absent. Query generation and ranking depend on Shopify/catalog/search history.
4. Check collection destination click-through, multi-page pagination, unusual product images, mixed variant sale prices and unavailable products in additional catalog cases. Collection rendering, native pagination code and sale/availability conditions are implemented; not every data combination was exercised in the browser.
5. Disable JavaScript and verify form submission/search-page links directly. The native form contract is tested, but the browser's JavaScript-disabled mode was not exercised.
6. Check English after publishing that language. Future Arabic must also receive locale content and RTL verification. Shopify's current predictive support list includes Swedish and English; unsupported buyer locales fall back to standard search. Collection suggestions are based on the store's primary language, not translated collection content.
7. If a test browser reaches a storefront password page, unlock the **development** storefront manually in that browser, reopen the existing preview and repeat the same terms. A password/redirect response is an access limitation, not proof of a search implementation failure. Do not change production password settings.

Future work can tune relevance/synonyms through Shopify Search & Discovery, audit assistive-technology behavior more broadly and add advanced result filters in a separate task. Task 05, external search services and homepage redesign were not started.

Official references: [implementation](https://shopify.dev/docs/storefronts/themes/navigation-search/search/predictive-search), [UX guidance](https://shopify.dev/docs/storefronts/themes/navigation-search/search/predictive-search-ux), [Predictive Search API](https://shopify.dev/docs/api/ajax/reference/predictive-search), [native storefront search](https://shopify.dev/docs/storefronts/themes/navigation-search/search).
