const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const parseThemeJson = file => JSON.parse(read(file).replace(/\/\*[\s\S]*?\*\//g, ''));

for (const layout of ['layout/theme.liquid', 'layout/password.liquid']) {
  const source = read(layout);
  assert.match(source, /class="skip-link"/);
  assert.match(source, /<main id="MainContent" tabindex="-1">/);
  assert.match(source, /dir="\{\{ text_direction \}\}"/);
}

const critical = read('assets/critical.css');
assert.match(critical, /\.skip-link:focus/);
assert.match(critical, /main \{[\s\S]*min-inline-size: 0/);

const header = read('sections/header.liquid');
assert.match(header, /data-cart-count-label/);
assert.doesNotMatch(header, /data-cart-count-link[^>]*aria-label=/);

const cart = read('assets/cart.js');
assert.match(cart, /querySelectorAll\('\[data-cart-count-label\]'\)/);

const metadata = read('snippets/meta-tags.liquid');
assert.match(metadata, /property="og:image:alt"/);
assert.match(metadata, /name="twitter:image"/);
assert.match(metadata, /page_description \| default: shop\.description/);

const media = read('snippets/product-media-gallery.liquid');
assert.match(media, /assign media_loading = 'eager'/);
assert.match(media, /fetchpriority: media_priority/);

for (const section of ['page', 'blog', 'article', '404', 'password', 'collections']) {
  assert.match(read(`sections/${section}.liquid`), /secondary\.css/);
}

const footer = read('sections/footer.liquid');
assert.match(footer, /<nav[^>]*aria-label=/);
assert.match(footer, /shop\.enabled_payment_types != empty/);

parseThemeJson('sections/header-group.json');
JSON.parse(read('locales/sv.default.json'));
JSON.parse(read('locales/en.json'));
assert.equal(fs.existsSync(path.join(root, 'snippets/image.liquid')), false);

console.log('Launch-readiness regression passed: landmarks, localization, metadata, media priority, secondary templates and valid section-group JSON');
