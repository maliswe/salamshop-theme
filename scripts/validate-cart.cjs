const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const cartSection = read('sections/cart.liquid');
const drawerSection = read('sections/cart-drawer.liquid');
const lineItem = read('snippets/cart-line-item.liquid');
const summary = read('snippets/cart-summary.liquid');
const empty = read('snippets/cart-empty.liquid');
const product = read('sections/product.liquid');
const productJs = read('assets/product.js');
const cartJs = read('assets/cart.js');
const header = read('sections/header.liquid');

assert.match(cartSection, /action="{{ routes\.cart_url }}" method="post"/);
assert.match(cartSection + summary, /name="checkout"/);
assert.match(cartSection, /name="update"/);
assert.match(cartSection, /name="note"/);
assert.match(drawerSection, /routes\.cart_add_url/);
assert.match(drawerSection, /routes\.cart_change_url/);
assert.match(drawerSection, /data-cart-section/);
assert.match(header, /data-cart-section/);
assert.match(header, /data-cart-count/);
assert.match(lineItem, /data-line-key="{{ item\.key/);
assert.match(lineItem, /data-cart-remove data-line-key/);
assert.match(lineItem, /item\.line_level_discount_allocations/);
assert.match(lineItem, /item\.selling_plan_allocation/);
assert.match(lineItem, /property_first != '_'/);
assert.match(summary, /cart\.cart_level_discount_applications/);
assert.match(summary, /cart\.total_price/);
assert.match(empty, /routes\.all_products_collection_url/);
assert.match(product, /form 'product', product/);
assert.match(productJs, /this\.adding/, 'Product add-to-cart must guard duplicate submissions');
assert.match(productJs, /this\.ajaxDisabled/, 'A network failure must leave a native retry path');
assert.match(cartJs, /id: key/, 'Cart changes must identify the exact line-item key');
assert.match(cartJs, /sections_url/);
assert.match(cartJs, /if \(!rendered\)/, 'Missing bundled sections need a non-mutating fallback');
assert.match(cartJs, /refreshCount/);
assert.match(cartJs, /event\.preventDefault\(\); this\.close\(\)/, 'Escape/cancel must close the modal');

const settings = JSON.parse(read('config/settings_schema.json'));
const cartSettings = settings.find(group => group.name === 't:cart_settings.title');
assert.ok(cartSettings, 'Global cart settings group is required');
const settingIds = new Set(cartSettings.settings.map(setting => setting.id));
for (const id of ['cart_behavior', 'cart_continue_shopping_link', 'cart_empty_collection', 'cart_empty_text', 'cart_empty_button_label', 'cart_show_notes', 'cart_show_thumbnails', 'cart_show_variant_details', 'cart_layout']) {
  assert.ok(settingIds.has(id), `Cart setting missing: ${id}`);
}

class MockElement extends EventTarget {
  constructor() { super(); this.dataset = {}; this.hidden = false; this.nodes = new Map(); this.nodeLists = new Map(); this.isConnected = true; }
  querySelector(selector) { return this.nodes.get(selector) || null; }
  querySelectorAll(selector) { return this.nodeLists.get(selector) || []; }
  closest() { return null; }
  setAttribute() {}
  removeAttribute() {}
  replaceWith() {}
  focus() { this.focused = true; }
}
class MockFormData {
  constructor(form) { this.form = form; this.values = new Map(); }
  set(key, value) { this.values.set(key, value); }
}
const config = new MockElement();
Object.assign(config.dataset, {
  cartBehavior: 'drawer', cartAddUrl: '/sv/cart/add.js', cartChangeUrl: '/sv/cart/change.js',
  cartJsonUrl: '/sv/cart.js', cartCountLabel: 'Varukorg (__COUNT__)', errorMessage: 'Fel',
  addedMessage: 'Tillagd', updatedMessage: 'Uppdaterad', removedMessage: 'Borttagen',
});
const headerTarget = new MockElement(); headerTarget.dataset.sectionId = 'header-id';
const drawerTarget = config; drawerTarget.dataset.sectionId = 'drawer-id';
const document = new MockElement();
document.documentElement = new MockElement();
document.querySelector = selector => {
  if (selector === 'cart-drawer') return config;
  if (selector === '[name="note"]') return null;
  if (selector === '[data-cart-drawer-dialog][open]') return null;
  if (selector === '[data-cart-drawer-open]') return null;
  return null;
};
document.querySelectorAll = selector => selector === '[data-cart-section][data-section-id]' ? [headerTarget, drawerTarget] : [];
const registry = new Map();
let fetchCalls = [];
const sandbox = vm.createContext({
  window: { location: { pathname: '/sv/products/test', search: '', href: 'https://example.test/sv/products/test' }, setTimeout },
  document, HTMLElement: MockElement, Event, EventTarget, CustomEvent, AbortController,
  FormData: MockFormData, URL, CSS: { escape: value => String(value) }, DOMParser: class {},
  requestAnimationFrame: fn => fn(), setTimeout, clearTimeout,
  customElements: { get: name => registry.get(name), define: (name, value) => registry.set(name, value) },
  fetch: async (url, options = {}) => {
    fetchCalls.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ sections: {} }) };
  },
});
sandbox.window.window = sandbox.window;
vm.runInContext(cartJs, sandbox);
const controller = sandbox.window.SalamCart;
assert.ok(controller, 'Cart controller registers once');
assert.equal(controller.isDrawerEnabled, true);
assert.deepEqual([...controller.sectionIds()], ['header-id', 'drawer-id']);

(async () => {
  let applied = null;
  controller.applyResponse = async (response, options) => { applied = { response, options }; };
  await controller.addProduct({ id: 'product-form' });
  assert.equal(fetchCalls[0].url, '/sv/cart/add.js');
  assert.equal(fetchCalls[0].options.method, 'POST');
  assert.equal(fetchCalls[0].options.body.values.get('sections'), 'header-id,drawer-id');
  assert.equal(fetchCalls[0].options.body.values.get('sections_url'), '/sv/products/test');
  assert.equal(applied.options.openDrawer, true);

  fetchCalls = [];
  await controller.changeLine('123:properties-hash', 3);
  const changeBody = JSON.parse(fetchCalls[0].options.body);
  assert.equal(fetchCalls[0].url, '/sv/cart/change.js');
  assert.equal(changeBody.id, '123:properties-hash');
  assert.equal(changeBody.quantity, 3);
  assert.deepEqual(changeBody.sections, ['header-id', 'drawer-id']);

  let countFallbacks = 0;
  controller.renderSections = () => false;
  controller.refreshSections = async () => false;
  controller.refreshCount = async () => { countFallbacks += 1; };
  await sandbox.window.SalamCartController.prototype.applyResponse.call(controller, { sections: { 'header-id': null } });
  assert.equal(countFallbacks, 1, 'Null bundled sections trigger one safe count fallback without repeating the mutation');

  sandbox.fetch = async () => ({ ok: false, status: 422, json: async () => ({ description: 'Slutsåld' }) });
  await assert.rejects(() => controller.request('/sv/cart/change.js', {}), error => error.serverResponse && error.status === 422 && error.message === 'Slutsåld');

  console.log('Cart passed: native fallbacks, exact line keys, locale routes, bundled sections, count fallback, server errors, settings and duplicate-add guards');
})().catch(error => { console.error(error); process.exitCode = 1; });
