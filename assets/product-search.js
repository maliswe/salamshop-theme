/* Shopify HTML is parsed as an inert document and narrowed before insertion. */
(() => {
  function buildSearchURL(endpoint, query, types, limit, origin) {
    const url = new URL(endpoint, origin);
    if (url.origin !== origin) throw new Error('Predictive search must be same-origin');
    const resources = String(types).split(',').filter(type => ['product', 'collection', 'query'].includes(type));
    url.searchParams.set('q', query.trim());
    url.searchParams.set('resources[type]', [...new Set(['product', ...resources])].join(','));
    url.searchParams.set('resources[limit]', String(Math.min(10, Math.max(1, Math.trunc(Number(limit)) || 8))));
    url.searchParams.set('resources[limit_scope]', 'all');
    url.searchParams.set('section_id', 'predictive-search');
    return url;
  }

  function cleanFragment(html, origin) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const fragment = parsed.querySelector('[data-predictive-fragment]');
    if (!fragment) throw new Error('Predictive fragment unavailable');
    const tags = new Set(['DIV', 'SECTION', 'H3', 'UL', 'LI', 'A', 'SPAN', 'IMG', 'S']);
    const attributes = new Set(['class', 'href', 'src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'aria-label', 'aria-hidden', 'data-result-link']);
    for (const node of [...fragment.querySelectorAll('*')]) {
      if (!tags.has(node.tagName)) { node.remove(); continue; }
      for (const attribute of [...node.attributes]) {
        if (!attributes.has(attribute.name)) node.removeAttribute(attribute.name);
      }
      for (const attribute of ['href', 'src']) {
        if (!node.hasAttribute(attribute)) continue;
        const url = new URL(node.getAttribute(attribute), origin);
        if (!['http:', 'https:'].includes(url.protocol) || (attribute === 'href' && url.origin !== origin)) throw new Error('Unsafe result URL');
      }
      // Image srcset is produced by Shopify image_tag. Reject non-web URL schemes.
      if (node.hasAttribute('srcset') && /(?:javascript|data|vbscript):/i.test(node.getAttribute('srcset'))) node.removeAttribute('srcset');
    }
    return fragment;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { buildSearchURL, cleanFragment };
  if (typeof customElements === 'undefined' || customElements.get('salam-search')) return;
  customElements.define('salam-search', class extends HTMLElement {
    connectedCallback() {
      if (this.events) return;
      this.events = new AbortController();
      const { signal } = this.events;
      this.input = this.querySelector('input[type="search"]');
      this.form = this.querySelector('form');
      this.popup = this.querySelector('[data-search-popup]');
      this.results = this.querySelector('[data-search-results]');
      this.status = this.querySelector('[data-search-status]');
      this.clear = this.querySelector('[data-search-clear]');
      this.version = 0;
      this.enabled = this.dataset.enabled === 'true';
      try {
        const features = document.getElementById('shopify-features');
        if (features && JSON.parse(features.textContent).predictiveSearch === false) this.enabled = false;
      } catch { /* Missing/unrecognized feature metadata falls back to the API. */ }
      if (this.enabled) {
        this.input.setAttribute('role', 'combobox');
        this.input.setAttribute('aria-haspopup', 'dialog');
        this.input.setAttribute('aria-autocomplete', 'list');
        this.input.setAttribute('aria-expanded', 'false');
        this.input.setAttribute('aria-controls', this.popup.id);
      }
      this.clear.hidden = !this.input.value;
      this.input.addEventListener('input', event => {
        this.invalidate();
        this.hide();
        this.results.replaceChildren();
        this.status.textContent = '';
        this.clear.hidden = !this.input.value;
        if (event.isComposing || !this.enabled || !this.input.value.trim()) return;
        const version = this.version;
        this.timer = setTimeout(() => { this.timer = null; this.load(this.input.value.trim(), version); }, 275);
      }, { signal });
      this.input.addEventListener('compositionend', () => this.input.dispatchEvent(new Event('input', { bubbles: true })), { signal });
      this.clear.addEventListener('click', () => {
        this.input.value = '';
        this.dismiss();
        this.clear.hidden = true;
        this.input.focus();
      }, { signal });
      this.querySelector('[data-search-close]').addEventListener('click', () => { this.dismiss(); this.input.focus(); }, { signal });
      this.form.addEventListener('submit', () => this.dismiss(), { signal });
      this.addEventListener('salam:search-dismiss', () => this.dismiss(), { signal });
      this.addEventListener('keydown', event => this.onKeydown(event), { signal });
      this.addEventListener('focusout', event => {
        // Some browsers report null while clicking a link. Removing that link
        // before its click default action would cancel navigation.
        if (event.relatedTarget && !this.contains(event.relatedTarget)) this.dismiss();
      }, { signal });
      document.addEventListener('pointerdown', event => {
        if (!this.contains(event.target)) this.dismiss();
      }, { signal });
    }

    invalidate() {
      this.version++;
      clearTimeout(this.timer);
      this.timer = null;
      this.request?.abort();
      this.removeAttribute('data-loading');
      this.results.removeAttribute('aria-busy');
    }

    async load(query, version) {
      if (!query || version !== this.version || !this.isConnected) return;
      const request = new AbortController();
      this.request = request;
      this.setAttribute('data-loading', '');
      this.results.setAttribute('aria-busy', 'true');
      this.status.textContent = this.dataset.loading;
      try {
        const url = buildSearchURL(this.dataset.endpoint, query, this.dataset.types, this.dataset.limit, location.origin);
        const response = await fetch(url, { signal: request.signal, credentials: 'same-origin', headers: { Accept: 'text/html' } });
        if (!response.ok || response.redirected) throw new Error('Predictive search unavailable');
        const html = await response.text();
        if (version !== this.version || !this.isConnected) return;
        const fragment = cleanFragment(html, location.origin);
        const count = Number(fragment.dataset.count);
        if (!Number.isFinite(count) || count < 0 || count > 10) throw new Error('Invalid result count');
        if (count === 0) {
          this.results.replaceChildren();
          this.hide();
          this.status.textContent = this.dataset.empty;
          return;
        }
        this.results.replaceChildren(...[...fragment.childNodes].map(node => document.importNode(node, true)));
        this.popup.hidden = false;
        this.input.setAttribute('aria-expanded', 'true');
        this.status.textContent = fragment.dataset.status;
      } catch (error) {
        if (version !== this.version || !this.isConnected || error.name === 'AbortError') return;
        this.results.replaceChildren();
        this.hide();
        this.status.textContent = this.dataset.error;
      } finally {
        if (version === this.version) {
          this.removeAttribute('data-loading');
          this.results.removeAttribute('aria-busy');
        }
      }
    }

    onKeydown(event) {
      if (event.key === 'Escape' && (!this.popup.hidden || this.timer || this.hasAttribute('data-loading'))) {
        event.preventDefault();
        event.stopPropagation();
        this.dismiss();
        this.input.focus();
        return;
      }
      if (this.popup.hidden) return;
      const links = [...this.results.querySelectorAll('a[data-result-link]')];
      const index = links.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp'].includes(event.key) && (event.target === this.input || index !== -1)) {
        event.preventDefault();
        const next = event.key === 'ArrowDown' ? index + 1 : (index === -1 ? links.length - 1 : index - 1);
        if (next < 0 || next >= links.length) this.input.focus();
        else links[next].focus();
      }
      // Enter activates the focused native link; on the input it submits the form.
    }

    hide() {
      this.popup.hidden = true;
      if (this.enabled) this.input.setAttribute('aria-expanded', 'false');
    }

    dismiss() {
      this.invalidate();
      this.hide();
      this.results.replaceChildren();
      this.status.textContent = '';
    }

    disconnectedCallback() {
      this.dismiss();
      this.events?.abort();
      this.events = null;
    }
  });
})();
