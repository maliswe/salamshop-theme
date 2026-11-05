const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const flatten = (value, prefix = '', result = {}) => {
  for (const [key, entry] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === 'object') flatten(entry, name, result);
    else {
      assert.equal(typeof entry, 'string', `${name} must be a string`);
      assert.ok(entry.trim(), `${name} must not be empty`);
      result[name] = entry;
    }
  }
  return result;
};
const tokens = value => (value.match(/{{[\s\S]*?}}|{%[\s\S]*?%}|<\/?[a-zA-Z][^>]*>/g) || []).map(token => token.trim()).sort();
const files = fs.readdirSync(path.join(root, 'locales')).sort();
assert.deepEqual(files, ['en.json', 'en.schema.json', 'sv.default.json', 'sv.default.schema.json']);
const locales = Object.fromEntries(files.map(file => [file, flatten(JSON.parse(read(`locales/${file}`)))]));
for (const [swedish, english] of [['sv.default.json', 'en.json'], ['sv.default.schema.json', 'en.schema.json']]) {
  assert.deepEqual(Object.keys(locales[swedish]).sort(), Object.keys(locales[english]).sort(), `${swedish}: key parity`);
  for (const key of Object.keys(locales[english])) {
    assert.deepEqual(tokens(locales[swedish][key]), tokens(locales[english][key]), `${key}: placeholders/HTML`);
  }
  console.log(`${swedish}: ${Object.keys(locales[swedish]).length} keys; JSON, parity, placeholders and HTML passed`);
}

const references = { storefront: new Map(), schema: new Map() };
function register(type, key, file) {
  assert.ok(Object.hasOwn(locales[type === 'schema' ? 'sv.default.schema.json' : 'sv.default.json'], key), `${file}: missing ${type} translation ${key}`);
  if (!references[type].has(key)) references[type].set(key, new Set());
  references[type].get(key).add(file);
}
function inspect(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { inspect(file); continue; }
    if (!/\.(liquid|json|css|js)$/.test(file)) continue;
    let source = read(file);
    if (file.endsWith('.liquid')) {
      source = source.replace(/{%[-]?\s*(comment|doc)\s*[-]?%}[\s\S]*?{%[-]?\s*end\1\s*[-]?%}/g, '');
    }
    for (const match of source.matchAll(/['"]([\w.]+)['"]\s*\|\s*t\b/g)) register('storefront', match[1], file);
    for (const match of source.matchAll(/"t:([\w.]+)"/g)) register('schema', match[1], file);
    for (const match of source.matchAll(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/g)) JSON.parse(match[1]);
  }
}
for (const dir of ['layout', 'sections', 'blocks', 'snippets', 'templates', 'config', 'assets']) inspect(dir);
for (const [type, keys] of Object.entries(references)) {
  console.log(`${type}: ${keys.size} unique referenced translation keys resolved`);
  if (process.argv.includes('--inventory')) {
    for (const [key, locations] of [...keys].sort(([a], [b]) => a.localeCompare(b))) console.log(`  ${key}: ${[...locations].join(', ')}`);
  }
}
