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
assert.doesNotMatch(recommendations, /Sedef|Imarat|Islamisk mössa/, 'Recommendations must be Shopify-driven, not fabricated');

const template = parseShopifyJson(read('templates/product.json'));
assert.equal(template.sections.main.type, 'product');
assert.equal(template.sections.recommendations.type, 'product-recommendations');
assert.deepEqual(template.order, ['main', 'recommendations']);
assert.equal(template.sections.main.blocks.size_guide.settings.option_name, 'Storlek');

assert.doesNotMatch(product + gallery + recommendations, /Sedef|Imarat|Islamisk mössa/, 'Product markup must not hardcode catalog data');
console.log('Product passed: native form, high-variant picker, media, metafields, sticky purchase control, recommendations and editor settings');
