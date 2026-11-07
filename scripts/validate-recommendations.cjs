const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const section = read('sections/product-recommendations.liquid');
const schema = JSON.parse(section.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
for (const id of ['enabled', 'heading', 'products_to_show', 'columns_desktop', 'show_prices', 'show_badges', 'show_actions', 'image_ratio', 'image_fit', 'quick_add_exclusions']) assert.ok(schema.settings.some(s => s.id === id), `Missing recommendation control: ${id}`);
assert.ok(schema.settings.find(s => s.id === 'products_to_show').max <= 10);
assert.match(section, /routes\.product_recommendations_url/);
assert.match(section, /intent=related/);
assert.match(section, /recommended_product\.id == product\.id or seen_ids contains product_key/);
assert.match(section, /render 'product-card'/);
assert.match(section, /<noscript>[\s\S]*routes\.all_products_collection_url/);
const action = read('snippets/recommendation-card-action.liquid');
assert.match(action, /product\.has_only_default_variant and product\.variants\.size == 1 and quick_variant\.available/);
for (const guard of ['requires_selling_plan', 'selling_plan_groups', 'template_suffix', 'quick_add_excluded', 'requires_personalization', 'quick_add_disabled']) assert.ok(action.includes(guard), `Missing purchase guard: ${guard}`);
assert.match(action, /form 'product', product/);
assert.match(action, /name="quantity" value="1"/);
assert.match(action, /name="id" value="{{ quick_variant\.id }}"/);
assert.match(action, /unless product\.available/);
assert.match(action, /type="button" disabled/);
assert.match(action, /role="alert"/);
assert.match(action, /role="status" aria-live="polite"/);
assert.doesNotMatch(action, /selected_or_first_available_variant/, 'Never silently choose a customer option');

class Element extends EventTarget {
  constructor() { super(); this.dataset = {}; this.hidden = true; this.isConnected = true; this.attrs = new Map(); this.nodes = new Map(); }
  querySelector(s) { return this.nodes.get(s) || null; }
  contains() { return true; }
  setAttribute(k, v) { this.attrs.set(k, v); }
  removeAttribute(k) { this.attrs.delete(k); }
}
const registry = new Map();
let cartAdd;
let fetchImpl;
let parsedCards = true;
const context = vm.createContext({
  HTMLElement: Element, AbortController,
  window: { SalamCart: { isDrawerEnabled: true, addProduct: (...args) => cartAdd(...args) } },
  customElements: { get: n => registry.get(n), define: (n, c) => registry.set(n, c) },
  fetch: (...args) => fetchImpl(...args),
  DOMParser: class { parseFromString() { return { querySelector: () => ({ innerHTML: '<article>real server card</article>', querySelector: () => parsedCards ? {} : null }) }; } }
});
const source = read('assets/product-recommendations.js');
vm.runInContext(source, context); vm.runInContext(source, context);
assert.equal(registry.size, 1);
const Recommendations = registry.get('product-recommendations');
function fixture() {
  const component = new Recommendations();
  Object.assign(component.dataset, { loadingLabel: 'Laddar', addedLabel: 'Tillagd', errorLabel: 'Fel', uncertainLabel: 'Kontrollera varukorgen', url: '/sv/recommendations/products?intent=related' });
  const form = new Element(); form.checkValidity = () => true; form.closest = () => form;
  const button = { textContent: 'Lägg i varukorgen', disabled: false };
  const status = { textContent: '' }, error = { hidden: true, textContent: '' }, recovery = { hidden: true };
  for (const [key, value] of [['button', button], ['status', status], ['error', error], ['recovery', recovery]]) form.nodes.set(`[data-quick-add-${key}]`, value);
  const event = () => ({ target: form, prevented: false, preventDefault() { this.prevented = true; } });
  return { component, form, button, status, error, recovery, event };
}

(async () => {
  let calls = 0, release;
  const f = fixture();
  cartAdd = (form, options) => { calls++; assert.equal(form, f.form); assert.equal(options.trigger, f.button); return new Promise(resolve => { release = resolve; }); };
  const first = f.component.onSubmit(f.event());
  assert.equal(f.button.disabled, true); assert.equal(f.form.dataset.quickAddState, 'busy');
  await f.component.onSubmit(f.event()); assert.equal(calls, 1, 'Rapid submissions create one mutation');
  release(); await first;
  assert.equal(f.button.disabled, false); assert.equal(f.status.textContent, 'Tillagd');

  const stock = fixture();
  cartAdd = async () => { throw Object.assign(new Error('Slutsåld'), { serverResponse: true }); };
  await stock.component.onSubmit(stock.event());
  assert.equal(stock.error.textContent, 'Slutsåld'); assert.equal(stock.error.hidden, false); assert.equal(stock.button.disabled, false);

  const network = fixture(); calls = 0;
  cartAdd = async () => { calls++; throw new Error('Connection lost'); };
  await network.component.onSubmit(network.event()); await network.component.onSubmit(network.event());
  assert.equal(calls, 1, 'Uncertain mutations cannot be replayed'); assert.equal(network.button.disabled, true);
  assert.equal(network.recovery.hidden, false); assert.equal(network.error.textContent, 'Kontrollera varukorgen');

  context.window.SalamCart.isDrawerEnabled = false;
  const native = fixture(), event = native.event(); await native.component.onSubmit(event);
  assert.equal(event.prevented, false, 'Native form remains usable without drawer enhancement');
  context.window.SalamCart.isDrawerEnabled = true;

  const loaded = fixture().component; calls = 0;
  fetchImpl = (url) => { calls++; assert.equal(url, loaded.dataset.url); return new Promise(resolve => { release = () => resolve({ ok: true, text: async () => '<server-html>' }); }); };
  const load = loaded.load(); await loaded.load(); assert.equal(calls, 1, 'Only one recommendation request in flight');
  release(); await load; await loaded.load(); assert.equal(calls, 1); assert.equal(loaded.hidden, false);

  for (const failure of ['http', 'network', 'empty']) {
    const empty = fixture().component; parsedCards = failure !== 'empty';
    fetchImpl = async () => { if (failure === 'network') throw new Error('Offline'); return { ok: failure !== 'http', text: async () => '' }; };
    await empty.load(); assert.equal(empty.hidden, true, `${failure} recommendations stay hidden`);
  }
  const life = fixture().component; life.dataset.loaded = 'true'; calls = 0; life.onSubmit = () => { calls++; };
  life.connectedCallback(); life.connectedCallback(); life.dispatchEvent(new Event('submit'));
  assert.equal(calls, 1, 'Reconnections do not duplicate submission handlers');
  life.disconnectedCallback(); life.dispatchEvent(new Event('submit')); assert.equal(calls, 1, 'Disconnect cleans listeners');
  console.log('Recommendations passed: native source/deduplication, guarded default-variant forms, shared cart, loading/duplicates, stock/network failures, recovery, empty results and lifecycle');
})().catch(error => { console.error(error); process.exitCode = 1; });
