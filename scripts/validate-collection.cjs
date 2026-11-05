const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const parseShopifyJson = source => JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, ''));
const source = read('sections/collection.liquid');
const schemaMatch = source.match(/{% schema %}([\s\S]*?){% endschema %}/);
assert.ok(schemaMatch, 'Collection section schema is required');
const schema = JSON.parse(schemaMatch[1]);

const settings = new Map(schema.settings.filter(setting => setting.id).map(setting => [setting.id, setting]));
for (const id of ['show_banner', 'show_collection_image', 'banner_image', 'mobile_banner_image', 'banner_layout', 'show_description', 'show_product_count', 'show_filters', 'show_sort', 'desktop_filter_layout', 'columns_desktop', 'products_per_page', 'image_ratio']) {
  assert.ok(settings.has(id), `Collection setting missing: ${id}`);
}
assert.equal(settings.get('products_per_page').default, 24);
assert.ok(settings.get('products_per_page').max <= 48);
assert.deepEqual(settings.get('desktop_filter_layout').options.map(option => option.value), ['sidebar', 'toolbar']);
assert.deepEqual(settings.get('banner_layout').options.map(option => option.value), ['split', 'overlay', 'text']);

const template = parseShopifyJson(read('templates/collection.json'));
assert.equal(template.sections.main.type, 'collection');
assert.equal(template.sections.main.settings.products_per_page, 24);
assert.equal(template.sections.main.settings.columns_desktop, 4);

assert.match(source, /collection\.filters/);
assert.match(source, /collection\.sort_options/);
assert.match(source, /collection\.sort_by \| default: collection\.default_sort_by/);
assert.match(source, /paginate collection\.products by section\.settings\.products_per_page/);
assert.match(source, /render 'product-card'/);
assert.match(source, /default_pagination/);
assert.match(source, /mobile_banner_image \| image_url/);
assert.match(source, /collection\.description/);
assert.match(source, /collection\.products_count/);
assert.doesNotMatch(source, /Sedef|Imarat|Islamisk mössa/, 'Collection markup must not hardcode catalog data');

const filters = read('snippets/collection-filters.liquid');
assert.match(filters, /action="{{ collection\.url }}" method="get"/);
assert.match(filters, /filter\.values/);
assert.match(filters, /value\.param_name/);
assert.match(filters, /value\.count == 0 and value\.active == false/);
assert.match(filters, /filter\.min_value\.param_name/);
assert.match(filters, /filter\.max_value\.param_name/);
assert.match(filters, /name="sort_by"/);
assert.doesNotMatch(filters, /name="(?:availability|vendor|size|color)"/i, 'Filter parameters must come from Shopify');

const active = read('snippets/collection-active-filters.liquid');
assert.match(active, /value\.url_to_remove/);
assert.match(active, /filter\.url_to_remove/);
assert.match(active, /collection\.sort_by \| url_encode/);

const productCard = read('snippets/product-card.liquid');
assert.match(productCard, /card_product\.compare_at_price > card_product\.price/);
assert.match(productCard, /product\.sale/);
assert.match(productCard, /card_product\.available/);
assert.match(productCard, /image_loading \| default: 'lazy'/);
assert.match(productCard, /money_with_currency/);

const css = read('assets/collection.css');
assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(css, /var\(--collection-columns\)/);
assert.match(css, /@media \(max-width: 23rem\)/);
assert.match(css, /body\[data-filter-drawer-open\]/);
assert.doesNotMatch(css, /overflow-x:\s*(auto|scroll)/);
assert.match(read('assets/product-card.css'), /prefers-reduced-motion: reduce/);

// Exercise the real drawer controller with a small DOM test double.
let activeElement = null;
class Element extends EventTarget {
  constructor() {
    super();
    this.nodes = new Map();
    this.nodeLists = new Map();
    this.attrs = new Map();
    this.hidden = false;
    this.open = false;
  }
  querySelector(selector) { return this.nodes.get(selector) || null; }
  querySelectorAll(selector) { return this.nodeLists.get(selector) || []; }
  setAttribute(name, value = '') { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
  hasAttribute(name) { return this.attrs.has(name); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  focus() { activeElement = this; }
  getClientRects() { return [{}]; }
}
const document = { body: new Element() };
Object.defineProperty(document, 'activeElement', { get: () => activeElement });
const registry = new Map();
const customElements = { get: name => registry.get(name), define: (name, constructor) => registry.set(name, constructor) };
const sandbox = vm.createContext({ HTMLElement: Element, Event, AbortController, document, customElements, window: { customElements }, requestAnimationFrame: fn => fn(), module: { exports: {} } });
const controller = read('assets/collection-filters.js');
vm.runInContext(controller, sandbox);
vm.runInContext(controller, sandbox);
assert.equal(registry.size, 1, 'Drawer custom element registers once');
const Drawer = registry.get('collection-filter-drawer');
const drawer = new Drawer();
const details = new Element();
const summary = new Element();
const panel = new Element();
const close = new Element();
const last = new Element();
panel.setAttribute('aria-modal', 'false');
drawer.nodes.set('details', details);
drawer.nodes.set('summary', summary);
drawer.nodes.set('[data-filter-panel]', panel);
drawer.nodes.set('[data-filter-close-button]', close);
drawer.nodeLists.set('[data-filter-close]', [close]);
panel.nodeLists.set('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])', [close, last]);
summary.focus();
drawer.connectedCallback();
assert.equal(panel.getAttribute('aria-modal'), 'false');
details.open = true;
details.dispatchEvent(new Event('toggle'));
assert.equal(panel.getAttribute('aria-modal'), 'true');
assert.equal(document.body.hasAttribute('data-filter-drawer-open'), true);
assert.equal(activeElement, close, 'Opening focuses the close control');
const escape = new Event('keydown', { cancelable: true });
Object.defineProperty(escape, 'key', { value: 'Escape' });
drawer.dispatchEvent(escape);
assert.equal(details.open, false, 'Escape closes the drawer');
details.dispatchEvent(new Event('toggle'));
assert.equal(document.body.hasAttribute('data-filter-drawer-open'), false);
assert.equal(activeElement, summary, 'Closing restores trigger focus');
details.open = true;
details.dispatchEvent(new Event('toggle'));
last.focus();
const tab = new Event('keydown', { cancelable: true });
Object.defineProperties(tab, { key: { value: 'Tab' }, shiftKey: { value: false } });
drawer.dispatchEvent(tab);
assert.equal(activeElement, close, 'Tab wraps within the open drawer');
drawer.disconnectedCallback();
assert.equal(document.body.hasAttribute('data-filter-drawer-open'), false);
assert.equal(panel.getAttribute('aria-modal'), 'false');

console.log('Collection passed: editor settings, native filters/sort URLs, active removal, pagination, shared cards, responsive grid and drawer focus/Escape/lifecycle behavior');
