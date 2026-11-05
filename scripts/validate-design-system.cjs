const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const schema = JSON.parse(read('config/settings_schema.json'));
const settings = schema.flatMap(group => group.settings || []).filter(setting => setting.id);
const ids = settings.map(setting => setting.id);
assert.equal(new Set(ids).size, ids.length, 'Global setting IDs must be unique');
const defaults = Object.fromEntries(settings.map(setting => [setting.id, setting.default]));
for (const setting of settings) {
  if (setting.type === 'range') {
    assert.ok(setting.default >= setting.min && setting.default <= setting.max, `${setting.id}: default in range`);
    assert.equal((setting.default - setting.min) % setting.step, 0, `${setting.id}: valid step`);
    assert.ok((setting.max - setting.min) / setting.step <= 100, `${setting.id}: Shopify range limit`);
  }
  if (setting.type === 'select') assert.ok(setting.options.some(option => option.value === setting.default), `${setting.id}: default option`);
  if (setting.type === 'color') assert.match(setting.default, /^#[\da-f]{6}$/i, `${setting.id}: color default`);
  if (setting.type === 'font_picker') assert.ok(setting.default, `${setting.id}: font default`);
}
assert.equal(defaults.type_primary_font, 'work_sans_n4');
assert.equal(defaults.type_heading_font, 'work_sans_n4');
const snippet = read('snippets/css-variables.liquid');
for (const match of snippet.matchAll(/settings\.([\w]+)/g)) assert.ok(ids.includes(match[1]), `Missing setting: ${match[1]}`);
const consumers = snippet
  + read('layout/theme.liquid')
  + read('snippets/bottom-navigation.liquid')
  + read('snippets/header-search.liquid')
  + read('snippets/search-product.liquid')
  + read('sections/predictive-search.liquid')
  + read('sections/header.liquid')
  + read('sections/cart.liquid')
  + read('sections/cart-drawer.liquid')
  + read('snippets/cart-line-item.liquid')
  + read('snippets/cart-empty.liquid');
for (const setting of settings.filter(s => s.type !== 'image_picker')) assert.ok(consumers.includes(`settings.${setting.id}`), `Unused global setting: ${setting.id}`);
assert.ok(settings.some(s => s.id === 'logo' && s.type === 'image_picker' && !s.default), 'Logo must require an original merchant asset');
const css = read('assets/critical.css');
const declarations = new Set([...snippet.matchAll(/(--[\w-]+)\s*:/g), ...css.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]));
for (const match of (css + snippet).matchAll(/var\((--[\w-]+)/g)) assert.ok(declarations.has(match[1]), `Undefined CSS token: ${match[1]}`);
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(label, a, b, minimum = 4.5) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  const ratio = (values[0] + 0.05) / (values[1] + 0.05);
  assert.ok(ratio >= minimum, `${label}: ${ratio.toFixed(2)} < ${minimum}`);
  console.log(`${label}: ${ratio.toFixed(2)}:1`);
}
for (const id of ['background_color', 'surface_color', 'secondary_surface_color', 'accent_color']) contrast(`Text on ${id}`, defaults.foreground_color, defaults[id]);
contrast('Primary button', defaults.button_primary_text, defaults.button_primary_background);
contrast('Secondary button', defaults.button_secondary_text, defaults.button_secondary_background);
contrast('Primary role', defaults.on_primary_color, defaults.primary_color);
contrast('Primary container', defaults.on_primary_container_color, defaults.primary_container_color);
contrast('Supporting text', defaults.on_surface_variant_color, defaults.surface_low_color);
contrast('Input outline', defaults.outline_color, defaults.background_color, 3);
contrast('Option outline', defaults.outline_color, defaults.surface_low_color, 3);
contrast('Error text', '#8a2c24', '#fff4f1');
contrast('Input boundary and focus', defaults.foreground_color, defaults.surface_color, 3);

// Check template/section/block references without uploading a theme.
const parseShopifyJson = source => JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/,\s*([}\]])/g, '$1'));
let templates = 0;
function localBlockTypes(sectionType) {
  const source = read(`sections/${sectionType}.liquid`);
  const match = source.match(/{% schema %}([\s\S]*?){% endschema %}/);
  if (!match) return new Set();
  const sectionSchema = JSON.parse(match[1]);
  return new Set((sectionSchema.blocks || []).map(block => block.type).filter(type => !type.startsWith('@')));
}
function checkBlocks(blocks = {}, allowedLocalTypes = new Set()) {
  for (const block of Object.values(blocks)) {
    if (block.type && !block.type.startsWith('@') && !allowedLocalTypes.has(block.type)) {
      assert.ok(fs.existsSync(path.join(root, 'blocks', `${block.type}.liquid`)), `Missing block ${block.type}`);
    }
    checkBlocks(block.blocks, allowedLocalTypes);
  }
}
for (const dir of ['templates', 'sections']) {
  for (const file of fs.readdirSync(path.join(root, dir)).filter(file => file.endsWith('.json'))) {
    const template = parseShopifyJson(read(`${dir}/${file}`));
    if (template.layout) assert.ok(fs.existsSync(path.join(root, 'layout', `${template.layout}.liquid`)), `Missing layout ${template.layout}`);
    for (const section of Object.values(template.sections || {})) {
      assert.ok(fs.existsSync(path.join(root, 'sections', `${section.type}.liquid`)), `Missing section ${section.type}`);
      checkBlocks(section.blocks, localBlockTypes(section.type));
    }
    for (const id of template.order || []) assert.ok(template.sections[id], `Invalid section order in ${file}`);
    templates++;
  }
}
console.log(`Passed: ${settings.length} settings, CSS token references, default contrast and ${templates} template/group references`);

if (process.argv.includes('--preview')) {
  // Local CSS fixture only. Font objects use system fallbacks, not Shopify CDN fonts.
  const escape = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const fontValues = { family: '"Segoe UI"', fallback_families: 'Arial, sans-serif', style: 'normal', weight: 400 };
  const variables = snippet.slice(snippet.indexOf(':root'), snippet.indexOf('{% endstyle %}')).replace(/{{\s*settings\.(\w+)(?:\.(\w+))?\s*(?:\|\s*(divided_by|times):\s*([\d.]+))?\s*}}/g, (_, key, property, operation, amount) => {
    let value = property ? (key === 'type_heading_font' && property === 'family' ? 'Georgia' : key === 'type_heading_font' && property === 'fallback_families' ? 'serif' : fontValues[property]) : defaults[key];
    if (operation) value = operation === 'times' ? value * Number(amount) : value / Number(amount);
    assert.notEqual(value, undefined, `Unresolved preview token: ${key}`);
    return value;
  });
  assert.ok(!variables.includes('{{'), 'All preview tokens resolved');
  const fixture = `<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SalamShop CSS foundations</title><style>${variables}${css}</style><body><main class="container section stack"><p>SalamShop · lokal stilkontroll</p><h1>Modern islamisk elegans</h1><p class="prose">Lugn form, varma toner och tydliga kontroller. Å, Ä, Ö · å, ä, ö. Detta är en lokal komponentkontroll, inte en butikssida.</p><div class="stack"><h2>Knappar och formulär</h2><div><button type="button">Lägg i varukorgen</button> <button class="button button--secondary" type="button">Fortsätt handla</button> <button disabled>Slutsåld</button></div><form class="stack"><div><label for="email">E-postadress</label><input id="email" type="email" placeholder="namn@exempel.se" aria-describedby="email-error" aria-invalid="true"><p class="form-message form-message--error" id="email-error">Ange en giltig e-postadress.</p></div><div><label for="size">Storlek</label><select id="size"><option>Välj storlek</option><option>Stor</option></select></div><div><label for="message">Meddelande</label><textarea id="message"></textarea></div></form></div><h2>Återanvändbara kort</h2><div class="grid">${['Bönematta', 'Presentförpackning', 'Parfym'].map(name => `<article class="product-card"><div class="product-card__content"><span class="badge badge--accent">Utvalt</span><h3>${name}</h3><p class="price">299 kr</p><a href="#details">Visa produktinformation</a><button type="button">Lägg i varukorgen</button></div></article>`).join('')}</div><p id="details">Kontrollera tangentbordsfokus med Tab. <a href="#email">Till formuläret</a></p></main></body></html>`;
  const widths = [320, 390, 768];
  const overview = `<!doctype html><html lang="sv"><meta charset="utf-8"><title>SalamShop responsive CSS preview</title><style>body{background:#e7decf;color:#252b29;font:16px system-ui;margin:24px}main{display:flex;gap:24px;align-items:start;width:max-content}iframe{height:1600px;border:1px solid #252b29;background:#f7f3ec}h1{font-size:24px}</style><h1>Lokal CSS-kontroll · systemtypsnitt · ingen Shopify-anslutning</h1><main>${widths.map(width => `<section><h2>${width} px</h2><iframe title="${width} px" width="${width}" srcdoc="${escape(fixture)}"></iframe></section>`).join('')}</main></html>`;
  const output = process.argv[process.argv.indexOf('--preview') + 1];
  assert.ok(output && !output.startsWith('--'), 'Provide an HTML output path after --preview');
  fs.writeFileSync(path.resolve(output), overview);
  console.log(`Local CSS preview saved: ${path.resolve(output)}`);
}
