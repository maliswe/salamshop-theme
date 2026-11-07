const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const parseShopifyJson = source => JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, ''));

const product = read('sections/product.liquid');
const schemaMatch = product.match(/{% schema %}([\s\S]*?){% endschema %}/);
assert.ok(schemaMatch, 'Product section schema is required');
const schema = JSON.parse(schemaMatch[1]);
const settings = new Map(schema.settings.filter(setting => setting.id).map(setting => [setting.id, setting]));
for (const id of ['image_ratio', 'thumbnail_position', 'enable_zoom', 'show_vendor', 'show_tax_note', 'show_quantity', 'show_dynamic_checkout', 'sticky_information', 'show_sticky_buy_bar']) {
  assert.ok(settings.has(id), `Product setting missing: ${id}`);
}
for (const id of ['image_fit', 'show_collection_label', 'show_short_description']) assert.ok(settings.has(id), `Product presentation setting missing: ${id}`);
assert.deepEqual(schema.blocks.map(block => block.type), ['description', 'material', 'dimensions', 'care', 'head_circumference', 'size_guide', 'collapsible', 'custom_liquid']);

assert.match(product, /form 'product', product/);
assert.match(product, /name="id" value="{{ current_variant\.id }}"/);
assert.match(product, /product\.options_with_values/);
assert.match(product, /option_value\.id/);
assert.match(product, /option_value\.variant\.url/);
assert.doesNotMatch(product, /for variant in product\.variants/, 'The primary selector must not load the capped product.variants array');
assert.match(product, /form="{{ form_id }}"/, 'The sticky button must submit the single native product form');
assert.match(product, /form \| payment_button/);
assert.match(product, /product\.metafields\.custom\.(material|langd|bredd|tvattrad|huvudomkrets)/);

const gallery = read('snippets/product-media-gallery.liquid');
for (const mediaType of ['image', 'video', 'external_video', 'model']) assert.match(gallery, new RegExp(`when '${mediaType}'`));
assert.match(gallery, /image_url: width: 1800/);
assert.match(gallery, /loading: 'lazy'/);
assert.match(gallery, /<dialog/);

const javascript = read('assets/product.js');
assert.match(javascript, /searchParams\.set\('option_values'/);
assert.match(javascript, /searchParams\.set\('section_id'/);
assert.match(javascript, /AbortController/);
assert.match(javascript, /window\.location\.assign\(option\.href\)/, 'A failed enhancement must return to the real option URL');
assert.match(javascript, /checkValidity/);
assert.match(javascript, /IntersectionObserver/);

const recommendations = read('sections/product-recommendations.liquid');
assert.match(recommendations, /routes\.product_recommendations_url/);
assert.match(recommendations, /intent=related/);
assert.match(recommendations, /render 'product-card'/);
assert.match(recommendations, /homepage_card: true/, 'Recommendations reuse the premium card presentation');
assert.doesNotMatch(recommendations, /Sedef|Imarat|Islamisk mössa/, 'Recommendations must be Shopify-driven, not fabricated');

const template = parseShopifyJson(read('templates/product.json'));
assert.equal(template.sections.main.type, 'product');
assert.equal(template.sections.recommendations.type, 'product-recommendations');
assert.deepEqual(template.order, ['main', 'recommendations']);
assert.equal(template.sections.main.blocks.size_guide.settings.option_name, 'Storlek');
assert.equal(template.sections.main.settings.thumbnail_position, 'bottom');

// Exercise the height guard: tall purchase content must scroll normally, and
// shorter content may stick only on desktop below the configured sticky header.
const vm = require('node:vm');
const registry = new Map();
let height = 600;
let desktop = true;
let resize;
let eligible = false;
let disconnected = false;
const information = { getBoundingClientRect: () => ({ height }), toggleAttribute: (name, value) => { assert.equal(name, 'data-sticky-fit'); eligible = value; } };
class ProductElement { querySelector(selector) { return selector === '.product-page__information--sticky' ? information : null; } }
class SizeObserver { constructor(callback) { resize = callback; } observe() {} disconnect() { disconnected = true; } }
const stickyContext = vm.createContext({
  HTMLElement: ProductElement, ResizeObserver: SizeObserver,
  customElements: { get: name => registry.get(name), define: (name, value) => registry.set(name, value) },
  document: { documentElement: {}, querySelector: () => null },
  getComputedStyle: () => ({ fontSize: '16px', getPropertyValue: () => '120px' }),
  window: { ResizeObserver: SizeObserver, innerHeight: 900, matchMedia: () => ({ matches: desktop }), addEventListener() {}, clearTimeout() {} }
});
vm.runInContext(javascript, stickyContext);
const stickyDetails = new (registry.get('product-details'))();
stickyDetails.abortController = { signal: {}, abort() {} };
stickyDetails.setupStickyInformation();
assert.equal(eligible, true, '600px content fits below a 120px header in a 900px viewport');
height = 800; resize();
assert.equal(eligible, false, 'Tall purchase content must never be trapped by sticky positioning');
height = 600; desktop = false; resize();
assert.equal(eligible, false, 'Mobile information must not become sticky');
stickyDetails.disconnectedCallback();
assert.equal(disconnected, true, 'Section replacements disconnect the size observer');

// A hidden recommendations element has no intersection box. Its section
// wrapper must trigger the existing native loader when approaching the viewport.
let observedTarget;
let intersect;
let loads = 0;
class RelatedObserver {
  constructor(callback) { intersect = callback; }
  observe(target) { observedTarget = target; }
  disconnect() {}
}
const relatedRegistry = new Map();
vm.runInNewContext(read('assets/product-recommendations.js'), {
  HTMLElement: class extends EventTarget {}, AbortController, IntersectionObserver: RelatedObserver,
  window: { IntersectionObserver: RelatedObserver },
  customElements: { get: name => relatedRegistry.get(name), define: (name, value) => relatedRegistry.set(name, value) }
});
const related = new (relatedRegistry.get('product-recommendations'))();
related.dataset = { url: '/recommendations/products' };
related.parentElement = {};
related.load = () => { loads++; };
related.connectedCallback();
assert.equal(observedTarget, related.parentElement, 'Observe the visible section wrapper');
intersect([{ isIntersecting: false }]);
assert.equal(loads, 0, 'Do not fetch distant recommendations');
intersect([{ isIntersecting: true }]);
assert.equal(loads, 1, 'Approaching the section triggers native recommendations');
related.disconnectedCallback();

assert.doesNotMatch(product + gallery + recommendations, /Sedef|Imarat|Islamisk mössa/, 'Product markup must not hardcode catalog data');
console.log('Product passed: native form, high-variant picker, media, metafields, sticky purchase control, recommendations and editor settings');
