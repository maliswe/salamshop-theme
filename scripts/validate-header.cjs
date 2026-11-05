const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const source = read("sections/header.liquid");
const schema = JSON.parse(
  source.match(/{% schema %}([\s\S]*?){% endschema %}/)[1],
);
const settings = schema.settings.filter((setting) => setting.id);
assert.equal(new Set(settings.map((s) => s.id)).size, settings.length);
for (const setting of settings) {
  if (setting.type === "range") {
    assert.ok(
      setting.default >= setting.min && setting.default <= setting.max,
      setting.id,
    );
    assert.equal((setting.default - setting.min) % setting.step, 0, setting.id);
    assert.ok((setting.max - setting.min) / setting.step <= 100, setting.id);
  }
  if (setting.type === "select")
    assert.ok(
      setting.options.some((option) => option.value === setting.default),
      setting.id,
    );
}
for (const match of source.matchAll(/section\.settings\.(\w+)/g))
  assert.ok(
    settings.some((s) => s.id === match[1]),
    `Unknown header setting: ${match[1]}`,
  );
assert.ok(
  source.includes("settings.logo | image_url") && !source.includes("crop:"),
  "Use the original logo without cropping",
);
const form = read("snippets/header-search.liquid");
assert.ok(
  form.includes("routes.search_url") &&
    form.includes('method="get"') &&
    form.includes('name="q"') &&
    form.includes('name="type" value="product"'),
  "Native product search contract",
);

// Focused controller tests use test doubles. Native dialog focus trapping and
// rendering still require browser verification; these tests do not simulate them.
let activeElement = null;
class Node extends EventTarget {
  constructor() {
    super();
    this.attributes = new Map();
    this.selectors = new Map();
    this.children = [];
    this.open = false;
    this.hidden = true;
    this.isConnected = true;
  }
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  getAttribute(name) {
    return this.attributes.get(name);
  }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelector(selector) {
    return this.selectors.get(selector) || null;
  }
  querySelectorAll(selector) {
    if (
      selector === "details[open]" ||
      selector === ".header-menu-root > li > details[open]"
    )
      return this.children.filter((child) => child.open);
    return this.selectors.get(selector) || [];
  }
  contains(node) {
    return this === node || this.children.some((child) => child.contains(node));
  }
  focus() {
    activeElement = this;
  }
  click() { this.dispatchEvent(new Event('click', { cancelable: true })); }
}
const document = new Node();
Object.defineProperty(document, "activeElement", { get: () => activeElement });
const breakpoint = new Node();
breakpoint.matches = false;
const registry = new Map();
const context = vm.createContext({
  HTMLElement: Node,
  AbortController,
  Event,
  document,
  matchMedia: () => breakpoint,
  customElements: {
    get: (key) => registry.get(key),
    define: (key, value) => {
      assert.ok(!registry.has(key));
      registry.set(key, value);
    },
  },
});
const controller = read("assets/header.js");
vm.runInContext(controller, context);
vm.runInContext(controller, context);
assert.equal(
  registry.size,
  1,
  "Repeated script evaluation must not redefine the element",
);
const Header = registry.get("salam-header");
function fixture() {
  const header = new Header();
  const dialog = new Node();
  const opener = new Node();
  const close = new Node();
  const desktop = new Node();
  const brand = new Node();
  let opens = 0;
  dialog.showModal = () => {
    opens++;
    dialog.open = true;
  };
  dialog.close = () => {
    dialog.open = false;
    dialog.dispatchEvent(new Event("close"));
  };
  dialog.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    right: 384,
    bottom: 800,
  });
  dialog.children.push(close);
  for (const [selector, node] of [
    ["[data-drawer]", dialog],
    ["[data-drawer-open]", opener],
    ["[data-drawer-close]", close],
    ["[data-desktop-nav]", desktop],
    [".header-brand", brand],
  ])
    header.selectors.set(selector, node);
  header.selectors.set(".header-menu-branch", []);
  return { header, dialog, opener, close, desktop, brand, opens: () => opens };
}
const fixtureA = fixture();
const { header, dialog, opener, close, desktop, brand } = fixtureA;
header.connectedCallback();
header.connectedCallback();
assert.equal(opener.hidden, false);
opener.dispatchEvent(new Event("click"));
assert.equal(
  fixtureA.opens(),
  1,
  "Connecting twice must not duplicate listeners",
);
assert.equal(dialog.open, true);
assert.equal(opener.getAttribute("aria-expanded"), "true");
assert.equal(
  activeElement,
  close,
  "Initial focus belongs on the close control",
);
const cancel = new Event("cancel", { cancelable: true });
dialog.dispatchEvent(cancel);
assert.equal(cancel.defaultPrevented, true);
assert.equal(dialog.open, false);
assert.equal(opener.getAttribute("aria-expanded"), "false");
assert.equal(
  activeElement,
  opener,
  "Escape/cancel returns focus to the opener",
);
opener.dispatchEvent(new Event("click"));
close.dispatchEvent(new Event("click"));
assert.equal(dialog.open, false, "Visible close control closes the drawer");
opener.dispatchEvent(new Event("click"));
const backdrop = new Event("click");
Object.assign(backdrop, { clientX: 500, clientY: 200 });
dialog.dispatchEvent(backdrop);
assert.equal(dialog.open, false, "Clicking outside the drawer closes it");
opener.dispatchEvent(new Event("click"));
breakpoint.matches = true;
breakpoint.dispatchEvent(new Event("change"));
assert.equal(dialog.open, false, "Resizing to desktop closes the modal");
assert.equal(
  activeElement,
  brand,
  "Resize restores focus to a visible element",
);
const count = fixtureA.opens();
opener.dispatchEvent(new Event("click"));
assert.equal(fixtureA.opens(), count, "Desktop cannot open a mobile dialog");
breakpoint.matches = false;
header.disconnectedCallback();
opener.dispatchEvent(new Event("click"));
assert.equal(
  fixtureA.opens(),
  count,
  "Disconnected elements have no live click listener",
);
header.connectedCallback();
opener.dispatchEvent(new Event("click"));
assert.equal(fixtureA.opens(), count + 1, "Reconnecting installs one listener");
header.disconnectedCallback();

const fixtureB = fixture();
const branch = new Node();
const sibling = new Node();
const summary = new Node();
const parentLink = new Node();
branch.selectors.set("summary", summary);
branch.selectors.set("a", parentLink);
const li = new Node();
const siblingLi = new Node();
const ul = new Node();
ul.children = [li, siblingLi];
li.parentElement = ul;
branch.parentElement = li;
li.selectors.set(":scope > details", branch);
siblingLi.selectors.set(":scope > details", sibling);
fixtureB.header.selectors.set(".header-menu-branch", [branch]);
fixtureB.desktop.children = [branch, sibling];
fixtureB.header.connectedCallback();
branch.open = true;
sibling.open = true;
branch.dispatchEvent(new Event("toggle"));
assert.equal(summary.getAttribute("aria-expanded"), "true");
assert.equal(sibling.open, false, "Opening a disclosure closes its sibling");
summary.closest = () => branch;
summary.matches = (selector) => selector === "summary";
summary.parentElement = branch;
branch.matches = () => true;
const escape = new Event("keydown", { cancelable: true });
Object.defineProperties(escape, {
  key: { value: "Escape" },
  target: { value: summary },
});
fixtureB.header.dispatchEvent(escape);
assert.equal(branch.open, false);
assert.equal(activeElement, summary);
assert.equal(escape.defaultPrevented, true);
const arrow = new Event("keydown", { cancelable: true });
Object.defineProperties(arrow, {
  key: { value: "ArrowDown" },
  target: { value: summary },
});
fixtureB.header.dispatchEvent(arrow);
assert.equal(branch.open, true);
assert.equal(activeElement, parentLink);
document.dispatchEvent(new Event("click"));
assert.equal(branch.open, false, "Outside clicks close desktop disclosures");
fixtureB.header.disconnectedCallback();

const fixtureC = fixture();
const searchToggle = new Node();
const searchInput = new Node();
const searchClose = new Node();
const searchPanel = new Node(); searchPanel.id = 'HeaderSearchPanel-test';
const searchComponent = new Node();
searchInput.closest = () => searchPanel;
fixtureC.header.selectors.set('.header-search-mobile', searchToggle);
fixtureC.header.selectors.set('input[type="search"]', searchInput);
fixtureC.header.selectors.set('[data-mobile-search-close]', searchClose);
fixtureC.header.selectors.set('salam-search', searchComponent);
fixtureC.header.connectedCallback();
searchToggle.dispatchEvent(new Event('click', { cancelable: true }));
assert.equal(fixtureC.header.hasAttribute('data-mobile-search-open'), true);
assert.equal(activeElement, searchInput, 'Mobile search opens the existing field and focuses it');
assert.equal(searchToggle.getAttribute('aria-expanded'), 'true');
assert.equal(searchToggle.getAttribute('role'), 'button');
fixtureC.opener.dispatchEvent(new Event('click'));
assert.equal(fixtureC.header.hasAttribute('data-mobile-search-open'), false, 'Opening navigation closes mobile search');
assert.equal(fixtureC.dialog.open, true);
searchToggle.dispatchEvent(new Event('click', { cancelable: true }));
assert.equal(fixtureC.dialog.open, false, 'Opening search closes navigation');
searchClose.dispatchEvent(new Event('click'));
assert.equal(activeElement, searchToggle);
fixtureC.header.disconnectedCallback();
console.log(
  `Header passed: ${settings.length} settings, native search contract, registration, lifecycle cleanup, drawer/cancel/backdrop/resize/focus and disclosure keyboard behavior`,
);
