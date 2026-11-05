const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const schema = JSON.parse(read('config/settings_schema.json'));
const settings = schema.flatMap(group => group.settings || []).filter(setting => setting.id);
const byId = Object.fromEntries(settings.map(setting => [setting.id, setting]));

const requiredSettings = {
  primary_color: '#9A6A22',
  on_primary_color: '#FFFFFF',
  primary_container_color: '#F3E9DF',
  on_primary_container_color: '#49391E',
  surface_low_color: '#FAF5ED',
  surface_high_color: '#E6D5BC',
  on_surface_variant_color: '#625C52',
  outline_color: '#81796B',
  shape_scale: 'expressive',
  show_bottom_navigation: true,
  bottom_navigation_menu: 'main-menu',
  show_floating_cart: true,
};

for (const [id, defaultValue] of Object.entries(requiredSettings)) {
  assert.ok(byId[id], `Missing Material setting: ${id}`);
  assert.equal(byId[id].default, defaultValue, `${id}: unexpected default`);
}

assert.equal(byId.button_corner_radius.default, 50, 'Buttons should be pill shaped');
assert.equal(byId.card_corner_radius.default, 24, 'Cards should use the expressive radius');
assert.equal(byId.input_corner_radius.default, 24, 'Inputs should use the expressive radius');

const variables = read('snippets/css-variables.liquid');
for (const token of [
  '--color-primary',
  '--color-on-primary',
  '--color-primary-container',
  '--color-on-primary-container',
  '--color-surface-low',
  '--color-surface-high',
  '--color-on-surface-variant',
  '--color-outline',
  '--radius-pill',
  '--elevation-1',
  '--elevation-2',
]) assert.ok(variables.includes(`${token}:`), `Missing Material token: ${token}`);

const layout = read('layout/theme.liquid');
assert.match(layout, /shape-\{\{ settings\.shape_scale/);
assert.match(layout, /render 'bottom-navigation'/);

const navigation = read('snippets/bottom-navigation.liquid');
assert.match(navigation, /settings\.bottom_navigation_menu\.links/);
assert.match(navigation, /limit: 4/);
assert.match(navigation, /link\.current or link\.active/);
assert.match(navigation, /aria-current="page"/);
assert.doesNotMatch(navigation, /href="\/|href='#'/, 'Bottom navigation must use merchant links');

const critical = read('assets/critical.css');
assert.match(critical, /\.bottom-navigation/);
assert.match(critical, /env\(safe-area-inset-bottom/);
assert.match(critical, /@media \(min-width: 48rem\)/);
assert.match(critical, /@media \(min-width: 64rem\)/);
assert.match(critical, /prefers-reduced-motion: reduce/);

const cart = read('sections/cart-drawer.liquid');
assert.match(cart, /settings\.show_floating_cart/);
assert.match(cart, /cart\.items limit: 3/);
assert.match(cart, /cart\.item_count/);
assert.match(cart, /data-cart-drawer-open/);
assert.doesNotMatch(cart, /wishlist|review|rating/i, 'Do not invent unavailable commerce data');

const product = read('sections/product.liquid');
for (const id of ['show_breadcrumbs', 'desktop_layout', 'information_surface']) {
  assert.ok(product.includes(`"id": "${id}"`), `Missing product presentation setting: ${id}`);
}
assert.match(product, /routes\.root_url/);
assert.match(product, /routes\.collections_url/);

const productCss = read('assets/product.css');
assert.match(productCss, /product-option__value/);
assert.match(productCss, /var\(--color-primary-container\)/);
assert.match(productCss, /product-sticky-buy/);

const allSource = fs.readdirSync(path.join(root, 'assets'))
  .filter(file => /\.(css|js)$/.test(file))
  .map(file => read(`assets/${file}`))
  .join('\n');
assert.doesNotMatch(allSource, /bootstrap|tailwind|materialize|@mui|material-components-web/i, 'No UI framework dependency is allowed');

console.log(`Passed: ${Object.keys(requiredSettings).length} settings, Material tokens, responsive navigation, product hierarchy and real-cart integration`);
