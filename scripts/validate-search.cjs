const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const { buildSearchURL } = require('../assets/product-search.js');
const origin = 'https://example.myshopify.com';
for (const locale of ['', '/sv', '/en', '/ar']) {
  const query = 'mössa & åäö / <"?>';
  const url = buildSearchURL(`${locale}/search/suggest`, ` ${query} `, 'product,collection,query', 8, origin);
  assert.equal(url.pathname, `${locale}/search/suggest`);
  assert.equal(url.searchParams.get('q'), query);
  assert.equal(url.searchParams.get('resources[limit_scope]'), 'all');
  assert.equal(url.searchParams.get('resources[limit]'), '8');
  assert.equal(url.searchParams.get('section_id'), 'predictive-search');
  assert.equal(url.searchParams.get('resources[type]'), 'product,collection,query');
}
assert.equal(buildSearchURL('/search/suggest', 'x', 'invalid,query', 100, origin).searchParams.get('resources[limit]'), '10');
assert.equal(buildSearchURL('/search/suggest', 'x', '', 0, origin).searchParams.get('resources[type]'), 'product');
assert.throws(() => buildSearchURL('https://other.example/search', 'x', '', 8, origin));

const markup = read('snippets/header-search.liquid');
assert.match(markup, /action="{{ routes.search_url }}" method="get"/);
assert.match(markup, /name="q"/); assert.match(markup, /name="type" value="product"/);
assert.match(markup, /data-endpoint="{{ routes.predictive_search_url }}"/);
assert.match(markup, /role="dialog"/); assert.match(markup, /role="status"/);
assert.match(markup, /for="HeaderSearch-{{ id }}"/);
assert.doesNotMatch(markup, /role="(?:option|listbox)"/);
assert.match(read('sections/predictive-search.liquid'), /predictive_search.resources.queries/);
assert.match(read('sections/predictive-search.liquid'), /query.text \| escape/);
assert.match(read('snippets/search-product.liquid'), /product.available/);
assert.match(read('snippets/search-product.liquid'), /product.compare_at_price > product.price/);
assert.match(read('sections/search.liquid'), /paginate search.results by 20/);
const schema = JSON.parse(read('config/settings_schema.json'));
const searchSettings = schema.find(group => group.name === 't:search_settings.title').settings;
assert.equal(searchSettings.length, 6);
assert.equal(searchSettings.find(setting => setting.id === 'search_suggestion_limit').default, 8);

// Test doubles exercise the actual controller without installing a DOM library.
// They do not replace browser/screen-reader or real Shopify API verification.
let activeElement = null;
class Element extends EventTarget {
  constructor(tag = 'DIV') { super(); this.tagName = tag; this.attrs = new Map(); this.dataset = {}; this.nodes = new Map(); this.children = []; this.childNodes = []; this.hidden = false; this.value = ''; this.isConnected = true; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
  hasAttribute(name) { return this.attrs.has(name); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  get attributes() { return [...this.attrs].map(([name, value]) => ({ name, value })); }
  querySelector(selector) { return this.nodes.get(selector) || null; }
  querySelectorAll(selector) { return selector === '*' ? this.children : (this.nodes.get(selector) || []); }
  replaceChildren(...nodes) { this.childNodes = nodes; }
  remove() { this.removed = true; }
  contains(node) { return node === this || this.children.includes(node); }
  focus() { activeElement = this; }
}
const document = new Element();
Object.defineProperty(document, 'activeElement', { get: () => activeElement });
let featureFlag = null;
document.getElementById = () => featureFlag;
document.importNode = node => node;
let parsedNodes = [];
class Parser {
  parseFromString(text) {
    const doc = new Element();
    if (text === 'password') return doc;
    const fragment = new Element();
    fragment.dataset = { count: text === 'empty' ? '0' : '1', status: `Found ${text}` };
    fragment.childNodes = [{ text }]; fragment.children = parsedNodes;
    doc.nodes.set('[data-predictive-fragment]', fragment);
    return doc;
  }
}
const registry = new Map();
const timers = new Map(); let clock = 0; let timerId = 0;
const requests = [];
const sandbox = vm.createContext({
  HTMLElement: Element, Event, AbortController, DOMParser: Parser, document, URL, location: { origin }, module: { exports: {} },
  setTimeout: (fn, delay) => { const id = ++timerId; timers.set(id, { fn, at: clock + delay }); return id; },
  clearTimeout: id => timers.delete(id),
  fetch: (url, options) => new Promise((resolve, reject) => requests.push({ url, options, resolve, reject })),
  customElements: { get: key => registry.get(key), define: (key, value) => { assert.ok(!registry.has(key)); registry.set(key, value); } }
});
const controller = read('assets/product-search.js');
vm.runInContext(controller, sandbox); vm.runInContext(controller, sandbox);
assert.equal(registry.size, 1);
const Search = registry.get('salam-search');
const tick = ms => { clock += ms; for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.fn(); } };
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const resolve = (index, text, overrides = {}) => requests[index].resolve({ ok: true, redirected: false, text: async () => text, ...overrides });
function fixture(enabled = 'true') {
  const component = new Search(); const input = new Element('INPUT'); const form = new Element('FORM'); const popup = new Element(); const results = new Element(); const status = new Element('P'); const clear = new Element('BUTTON'); const close = new Element('BUTTON');
  popup.id = `suggestions-${timerId}`; popup.hidden = true;
  component.dataset = { enabled, endpoint: '/sv/search/suggest', types: 'product,collection,query', limit: '8', loading: 'Loading', error: 'Error', empty: 'Empty' };
  for (const [selector, node] of [['input[type="search"]', input], ['form', form], ['[data-search-popup]', popup], ['[data-search-results]', results], ['[data-search-status]', status], ['[data-search-clear]', clear], ['[data-search-close]', close]]) component.nodes.set(selector, node);
  component.children = [input, form, popup, results, status, clear, close];
  component.connectedCallback();
  return { component, input, form, popup, results, status, clear, close };
}
function type(f, value) { f.input.value = value; f.input.dispatchEvent(new Event('input')); }
function key(f, name, target = f.input) {
  const event = new Event('keydown', { cancelable: true });
  Object.defineProperties(event, { key: { value: name }, target: { value: target } });
  f.component.dispatchEvent(event); return event;
}

(async () => {
  const f = fixture(); f.component.connectedCallback();
  assert.equal(f.input.getAttribute('role'), 'combobox');
  assert.equal(f.input.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(f.input.getAttribute('aria-controls'), f.popup.id);
  type(f, 's'); tick(200); type(f, 'sedef'); tick(274); assert.equal(requests.length, 0);
  tick(1); assert.equal(requests.length, 1, 'Debounce fires once after 275ms');
  assert.equal(f.status.textContent, 'Loading');
  type(f, 'mössa'); assert.equal(requests[0].options.signal.aborted, true);
  tick(275); assert.equal(requests.length, 2);
  resolve(1, 'new'); await flush();
  assert.equal(f.results.childNodes[0].text, 'new'); assert.equal(f.popup.hidden, false);
  resolve(0, 'old'); await flush();
  assert.equal(f.results.childNodes[0].text, 'new', 'An old successful response cannot replace newer content');
  const a = new Element('A'); const b = new Element('A');
  f.results.nodes.set('a[data-result-link]', [a, b]); f.component.children.push(a, b);
  f.input.focus(); key(f, 'ArrowDown'); assert.equal(activeElement, a);
  key(f, 'ArrowDown', a); assert.equal(activeElement, b);
  key(f, 'ArrowUp', b); assert.equal(activeElement, a);
  key(f, 'ArrowUp', a); assert.equal(activeElement, f.input);
  f.input.focus(); key(f, 'ArrowUp'); assert.equal(activeElement, b);
  assert.equal(key(f, 'Enter', b).defaultPrevented, false, 'Native link activation remains intact');
  assert.equal(key(f, 'Enter').defaultPrevented, false, 'Native form submission remains intact');
  const transientBlur = new Event('focusout'); Object.defineProperty(transientBlur, 'relatedTarget', { value: null }); f.component.dispatchEvent(transientBlur);
  assert.equal(f.popup.hidden, false, 'Null focus transitions must not remove links before their click action');
  key(f, 'Escape'); assert.equal(f.popup.hidden, true); assert.equal(activeElement, f.input); assert.equal(f.input.value, 'mössa');
  assert.equal(key(f, 'Escape').defaultPrevented, false, 'Second Escape is available to the mobile header');
  type(f, ''); tick(500); assert.equal(requests.length, 2); assert.equal(f.results.childNodes.length, 0);
  type(f, 'error'); tick(275); requests[2].reject(new Error('Offline')); await flush();
  assert.equal(f.status.textContent, 'Error'); assert.equal(f.popup.hidden, true);
  type(f, 'password'); tick(275); resolve(3, 'password'); await flush();
  assert.equal(f.status.textContent, 'Error', 'Password HTML is an unavailable suggestion response, not invented matches');
  type(f, 'empty'); tick(275); resolve(4, 'empty'); await flush();
  assert.equal(f.status.textContent, 'Empty'); assert.equal(f.popup.hidden, true);
  type(f, 'redirect'); tick(275); resolve(5, 'new', { redirected: true }); await flush(); assert.equal(f.status.textContent, 'Error');
  type(f, 'throttle'); tick(275); resolve(6, 'new', { ok: false }); await flush(); assert.equal(f.status.textContent, 'Error');
  type(f, 'pending'); tick(275); key(f, 'Escape'); resolve(7, 'stale'); await flush();
  assert.equal(f.results.childNodes.length, 0, 'A dismissed request cannot reopen the dropdown');
  type(f, 'blur'); tick(275);
  const blur = new Event('focusout'); Object.defineProperty(blur, 'relatedTarget', { value: new Element() }); f.component.dispatchEvent(blur);
  resolve(8, 'late'); await flush(); assert.equal(f.popup.hidden, true);
  type(f, 'clear'); f.clear.dispatchEvent(new Event('click')); tick(300); assert.equal(requests.length, 9); assert.equal(f.input.value, '');
  type(f, 'disconnect'); f.component.disconnectedCallback(); tick(300); assert.equal(requests.length, 9);
  f.component.connectedCallback(); type(f, 'reconnect'); tick(275); assert.equal(requests.length, 10);
  document.dispatchEvent(new Event('pointerdown')); resolve(9, 'outside'); await flush(); assert.equal(f.popup.hidden, true);
  f.component.disconnectedCallback();
  const disabled = fixture('false'); type(disabled, 'disabled'); tick(300); assert.equal(requests.length, 10); assert.equal(disabled.input.getAttribute('role'), null); disabled.component.disconnectedCallback();
  const first = fixture(); const second = fixture();
  type(first, 'first instance'); type(second, 'second instance'); tick(275);
  assert.equal(requests.length, 12);
  first.clear.dispatchEvent(new Event('click'));
  resolve(10, 'old-first'); resolve(11, 'second'); await flush();
  assert.equal(first.popup.hidden, true);
  assert.equal(second.results.childNodes[0].text, 'second', 'Clearing one instance does not cancel another');
  first.component.disconnectedCallback(); second.component.disconnectedCallback();
  featureFlag = { textContent: '{"predictiveSearch":false}' };
  const unsupported = fixture(); type(unsupported, 'unsupported'); tick(300); assert.equal(requests.length, 12); unsupported.component.disconnectedCallback();

  const clean = sandbox.module.exports.cleanFragment;
  const anchor = new Element('A'); anchor.setAttribute('href', '/sv/products/example?variant=123'); anchor.setAttribute('onclick', 'bad()');
  const script = new Element('SCRIPT'); parsedNodes = [anchor, script]; clean('safe', origin);
  assert.equal(anchor.hasAttribute('onclick'), false); assert.equal(script.removed, true);
  anchor.setAttribute('href', 'javascript:bad()'); assert.throws(() => clean('unsafe', origin));
  anchor.setAttribute('href', 'https://external.example/'); assert.throws(() => clean('unsafe', origin));
  console.log('Search passed: structure/settings, locale URLs/encoding/limits, 275ms debounce, abort/stale responses, empty/error/password/HTTP paths, keyboard/native Enter, lifecycle/multiple instances, feature flag and markup allowlist');
})().catch(error => { console.error(error); process.exitCode = 1; });
