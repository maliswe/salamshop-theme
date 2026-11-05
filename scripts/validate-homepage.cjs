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
const expectedTypes = sectionFiles.map(file => path.basename(file, '.liquid'));
for (const type of expectedTypes) {
  assert.ok(Object.values(index.sections).some(section => section.type === type), `Homepage is missing ${type}`);
}
assert.deepEqual(new Set(index.order), new Set(Object.keys(index.sections)), 'Homepage order and section map must match');
assert.equal(index.sections.categories.block_order.length, 7, 'Default homepage must expose seven category blocks');
assert.equal(index.sections.values.disabled, true, 'Unapproved brand claims stay disabled by default');

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
assert.doesNotMatch(css, /overflow-x:\s*(auto|scroll)/, 'Homepage must not rely on horizontal scrolling');
assert.match(read('layout/theme.liquid'), /template\.name == 'index'[\s\S]*homepage\.css/);

console.log('Homepage passed: seven editor sections/presets, JSON composition, shared product cards, responsive images/layout, customer newsletter form, localization hooks and reduced-motion support');
