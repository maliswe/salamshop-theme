const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const parseShopifyJson = source => JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, ''));
const schemaFor = file => {
  const source = read(file);
  const match = source.match(/{% schema %}([\s\S]*?){% endschema %}/);
  assert.ok(match, `${file} must have a schema`);
  return { source, schema: JSON.parse(match[1]) };
};

const sectionFiles = [
  'sections/home-hero.liquid',
  'sections/home-categories.liquid',
  'sections/home-featured-products.liquid',
  'sections/home-editorial.liquid',
  'sections/home-new-arrivals.liquid',
  'sections/home-news.liquid',
  'sections/home-brand-values.liquid',
  'sections/home-newsletter.liquid'
];

for (const file of sectionFiles) {
  const { schema } = schemaFor(file);
  assert.ok(schema.name.startsWith('t:'), `${file} name must be localized`);
  assert.ok(Array.isArray(schema.presets) && schema.presets.length, `${file} must be addable in the editor`);
  for (const preset of schema.presets) assert.ok(preset.name.startsWith('t:'), `${file} preset name must be localized`);
}

const index = parseShopifyJson(read('templates/index.json'));
// New arrivals remains addable and validated, but News owns its former homepage slot.
const expectedTypes = sectionFiles.filter(file => file !== 'sections/home-new-arrivals.liquid').map(file => path.basename(file, '.liquid'));
for (const type of expectedTypes) {
  assert.ok(Object.values(index.sections).some(section => section.type === type), `Homepage is missing ${type}`);
}
assert.deepEqual(new Set(index.order), new Set(Object.keys(index.sections)), 'Homepage order and section map must match');
assert.equal(index.sections.categories.block_order.length, 7, 'Default homepage must expose seven category blocks');
assert.equal(index.sections.values.disabled, true, 'Unapproved brand claims stay disabled by default');
assert.equal(index.sections.arrivals.type, 'home-news', 'Nyheter must display articles, not products');
assert.ok(index.order.indexOf('arrivals') > index.order.indexOf('editorial'), 'News keeps its position after editorial');

const news = schemaFor('sections/home-news.liquid');
assert.ok(news.schema.settings.some(setting => setting.id === 'selected_blog' && setting.type === 'blog'), 'News needs a native Shopify blog picker');
for (const id of ['heading', 'article_limit', 'show_date', 'show_excerpt', 'columns_desktop', 'show_view_all']) {
  assert.ok(news.schema.settings.some(setting => setting.id === id), `News setting missing: ${id}`);
}
assert.match(news.source, /news_blog\.articles limit: section\.settings\.article_limit/);
assert.match(news.source, /news_article\.url/);
assert.match(news.source, /news_blog\.url/);
assert.match(news.source, /news_article\.published_at \| time_tag/);
assert.match(news.source, /news_article\.excerpt \| default: news_article\.content \| strip_html/);
assert.match(news.source, /news_blog\.articles_count > 0/);
assert.match(news.source, /if has_articles or request\.design_mode/);
assert.match(news.source, /#shopify-section-{{ section.id }} \{ display: none; \}/, 'Empty storefront news must not leave wrapper spacing');
assert.doesNotMatch(news.source, /product-grid|product-card|type": "collection"|buy_now|compare_at_price|money_with_currency/, 'News must not render commerce content');

const hero = schemaFor('sections/home-hero.liquid');
for (const id of ['image', 'mobile_image', 'eyebrow', 'heading', 'description', 'primary_label', 'primary_link', 'secondary_label', 'secondary_link', 'text_alignment', 'content_position', 'height_mobile', 'height_desktop', 'overlay_opacity']) {
  assert.ok(hero.schema.settings.some(setting => setting.id === id), `Hero setting missing: ${id}`);
}
assert.match(hero.source, /fetchpriority: 'high'/);
assert.match(hero.source, /widths: '750, 1100, 1500, 2000, 2400'/);
assert.ok(hero.schema.settings.some(setting => setting.id === 'height_mode' && setting.default === 'editorial'), 'Editorial geometry must be the default; custom height remains available');
assert.match(hero.source, /presentation\.focal_point/, 'Hero must respect merchant focal points');
assert.match(hero.source, /home-hero--empty/, 'Unconfigured hero needs a legible fallback');

const categories = schemaFor('sections/home-categories.liquid');
const categoryBlock = categories.schema.blocks.find(block => block.type === 'category');
for (const id of ['collection', 'image', 'label']) assert.ok(categoryBlock.settings.some(setting => setting.id === id), `Category block setting missing: ${id}`);
assert.doesNotMatch(categories.source, /collections\[['"][^'"]+/i, 'Collection handles must not be hardcoded');

for (const file of ['sections/home-featured-products.liquid', 'sections/home-new-arrivals.liquid']) {
  const { source, schema } = schemaFor(file);
  for (const id of ['collection', 'product_limit', 'columns_mobile', 'columns_desktop', 'image_ratio']) {
    assert.ok(schema.settings.some(setting => setting.id === id), `${file} setting missing: ${id}`);
  }
  assert.match(source, /render 'product-grid'/, `${file} must use the shared product grid`);
}

const productCard = read('snippets/product-card.liquid');
assert.match(productCard, /product\.featured_media\.preview_image/);
assert.match(productCard, /product\.available/);
assert.match(productCard, /compare_at_price > card_product\.price/);
assert.match(productCard, /money_with_currency/);
assert.doesNotMatch(productCard, /add_to_cart|product-form/, 'Homepage cards must not create a second cart flow');

const editorial = schemaFor('sections/home-editorial.liquid').schema;
for (const id of ['image', 'image_position', 'background', 'button_label', 'button_link']) assert.ok(editorial.settings.some(setting => setting.id === id), `Editorial setting missing: ${id}`);

const values = schemaFor('sections/home-brand-values.liquid').schema;
assert.match(read('sections/home-brand-values.liquid'), /if block\.settings\.title == blank and block\.settings\.description == blank[\s\S]*?continue/, 'Empty service claims must not render');
assert.ok(values.blocks.find(block => block.type === 'value'), 'Brand values need repeatable blocks');
assert.ok(values.blocks[0].settings.some(setting => setting.id === 'image'), 'Value blocks need image overrides');

const newsletter = schemaFor('sections/home-newsletter.liquid').source;
assert.match(newsletter, /form 'customer'/);
assert.match(newsletter, /name="contact\[email\]"/);
assert.match(newsletter, /name="contact\[tags\]" value="newsletter"/);
assert.match(newsletter, /form\.posted_successfully\?/);
assert.match(newsletter, /form\.errors/);

const css = read('assets/homepage.css');
assert.match(css, /@media \(min-width: 48rem\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
// Only the category track may scroll horizontally; other homepage rules retain
// the original ban. Match declarations and selectors rather than exempting a file.
const cssRules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)];
let categoryScrollRules = 0;
for (const [, selector, declarations] of cssRules) {
  if (!/overflow(?:-x|-inline)?\s*:\s*(?:auto|scroll)\b/.test(declarations)) continue;
  assert.equal(selector.trim(), '.home-categories__grid', 'Only the category track may scroll horizontally');
  categoryScrollRules++;
  assert.match(declarations, /scrollbar-width:\s*none/, 'Firefox scrollbar must stay hidden');
  assert.match(declarations, /scroll-snap-type:\s*inline proximity/, 'Native category snap behavior');
}
assert.equal(categoryScrollRules, 1, 'Categories need exactly one native scrolling rule');
assert.match(css, /\.home-categories__grid::-webkit-scrollbar\s*\{[^}]*display:\s*none/, 'WebKit/Chromium scrollbar must stay hidden');
assert.match(css, /@container home-categories \(min-width: 60rem\)/, 'Desktop fit follows available category width');
assert.match(categories.source, /role="region"[^>]*aria-label="[^>]*tabindex="0"/, 'Native track must be named and keyboard focusable');
// The optional enhancement fixes partial native focus reveal; scrolling itself
// remains CSS-driven. Check right/left visibility, desktop no-op and cleanup.
const vm = require('node:vm');
const tracks = new Map();
class Track extends EventTarget {
  constructor() {
    super();
    this.clientWidth = 300;
    this.scrollWidth = 952;
    this.scrolls = [];
  }
  getBoundingClientRect() { return { left: 0, right: 300 }; }
  scrollBy(options) { this.scrolls.push(options); }
}
const trackContext = vm.createContext({
  HTMLElement: Track,
  AbortController,
  getComputedStyle: () => ({ paddingInlineStart: '8px' }),
  customElements: {
    get: name => tracks.get(name),
    define: (name, value) => { assert.ok(!tracks.has(name)); tracks.set(name, value); }
  }
});
const trackSource = read('assets/home-categories.js');
vm.runInContext(trackSource, trackContext);
vm.runInContext(trackSource, trackContext);
const track = new (tracks.get('salam-category-track'))();
track.connectedCallback();
track.connectedCallback();
const card = { parentElement: track, getBoundingClientRect: () => ({ left: 230, right: 350 }) };
card.closest = () => card;
const focusCard = () => {
  const event = new Event('focusin');
  Object.defineProperty(event, 'target', { value: card });
  track.dispatchEvent(event);
};
focusCard();
assert.equal(track.scrolls.length, 1, 'Repeated connection must not duplicate focus listeners');
assert.equal(track.scrolls[0].left, 58, 'Reveal the right edge plus focus inset');
assert.equal(track.scrolls[0].behavior, 'instant', 'Focus reveal must not animate');
card.getBoundingClientRect = () => ({ left: -20, right: 100 });
focusCard();
assert.equal(track.scrolls[1].left, -28, 'Reveal the left edge plus focus inset');
track.scrollWidth = track.clientWidth;
focusCard();
assert.equal(track.scrolls.length, 2, 'Desktop grid must not scroll');
track.scrollWidth = 952;
track.disconnectedCallback();
focusCard();
assert.equal(track.scrolls.length, 2, 'Detached tracks must clean up listeners');
assert.match(read('layout/theme.liquid'), /template\.name == 'index'[\s\S]*homepage\.css/);

console.log('Homepage passed: eight editor sections/presets, news blog picker/articles/empty states, JSON composition, preserved New arrivals, shared product cards, responsive images/layout, newsletter, localization and reduced-motion support');
