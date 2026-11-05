(() => {
  if (window.SalamCart) return;

  class CartRequestError extends Error {
    constructor(message, status = 0, serverResponse = false) {
      super(message);
      this.name = 'CartRequestError';
      this.status = status;
      this.serverResponse = serverResponse;
    }
  }

  class CartController {
    constructor() {
      this.lineQueues = new Map();
      this.inputTimers = new Map();
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      document.addEventListener('click', event => this.onClick(event), { signal });
      document.addEventListener('change', event => this.onChange(event), { signal });
    }

    get config() { return document.querySelector('cart-drawer'); }
    get isDrawerEnabled() { return this.config?.dataset.cartBehavior === 'drawer'; }

    sectionIds() {
      return [...new Set([...document.querySelectorAll('[data-cart-section][data-section-id]')]
        .map(section => section.dataset.sectionId)
        .filter(Boolean))].slice(0, 5);
    }

    sectionFields(body) {
      const ids = this.sectionIds();
      if (ids.length) body.set('sections', ids.join(','));
      body.set('sections_url', `${window.location.pathname}${window.location.search}`);
      return body;
    }

    async request(url, options) {
      let response;
      try {
        response = await fetch(url, options);
      } catch (error) {
        throw new CartRequestError(error.message, 0, false);
      }
      let data = {};
      try { data = await response.json(); } catch (_) { /* Shopify can return an empty proxy response. */ }
      if (!response.ok) {
        throw new CartRequestError(data.description || data.message || this.errorMessage(), response.status, true);
      }
      return data;
    }

    async addProduct(form) {
      const config = this.config;
      if (!config) throw new CartRequestError(this.errorMessage());
      const body = this.sectionFields(new FormData(form));
      const response = await this.request(config.dataset.cartAddUrl, {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body,
      });
      await this.applyResponse(response, { openDrawer: true, announcement: config.dataset.addedMessage });
      return response;
    }

    async changeLine(key, quantity) {
      const config = this.config;
      if (!config) throw new CartRequestError(this.errorMessage());
      const body = {
        id: key,
        quantity,
        sections: this.sectionIds(),
        sections_url: `${window.location.pathname}${window.location.search}`,
      };
      return this.request(config.dataset.cartChangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(body),
      });
    }

    renderSections(sections) {
      if (!sections || typeof sections !== 'object') return false;
      const ids = this.sectionIds();
      let complete = ids.length > 0;
      ids.forEach(id => {
        const html = sections[id];
        const current = document.querySelector(`[data-cart-section][data-section-id="${CSS.escape(id)}"]`);
        if (!html || !current) { complete = false; return; }
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const replacement = parsed.querySelector(`[data-cart-section][data-section-id="${CSS.escape(id)}"]`);
        if (!replacement) { complete = false; return; }
        current.replaceWith(replacement);
      });
      return complete;
    }

    async refreshSections() {
      const ids = this.sectionIds();
      if (!ids.length) return false;
      const url = new URL(window.location.href);
      url.searchParams.set('sections', ids.join(','));
      try {
        const response = await fetch(url, { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
        if (!response.ok) return false;
        return this.renderSections(await response.json());
      } catch (_) { return false; }
    }

    async refreshCount() {
      const config = this.config;
      if (!config) return;
      try {
        const cart = await this.request(config.dataset.cartJsonUrl, { headers: { Accept: 'application/json' } });
        document.querySelectorAll('[data-cart-count]').forEach(count => { count.textContent = String(cart.item_count); });
        document.querySelectorAll('[data-cart-count-link]').forEach(link => {
          link.setAttribute('aria-label', config.dataset.cartCountLabel.replace('__COUNT__', String(cart.item_count)));
        });
      } catch (_) { /* A count refresh must never repeat a cart mutation. */ }
    }

    async applyResponse(response, { openDrawer = false, announcement = '' } = {}) {
      const drawerWasOpen = Boolean(document.querySelector('[data-cart-drawer-dialog][open]'));
      const pendingNote = document.querySelector('[name="note"]')?.value;
      const rendered = this.renderSections(response.sections);
      if (!rendered) {
        const refreshed = await this.refreshSections();
        if (!refreshed) await this.refreshCount();
      }
      if (pendingNote != null) {
        const note = document.querySelector('[name="note"]');
        if (note) note.value = pendingNote;
      }
      this.announce(announcement);
      if (openDrawer || drawerWasOpen) {
        document.querySelector('cart-drawer')?.open(document.querySelector('[data-cart-drawer-open]'));
      }
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: response } }));
    }

    queueChange(key, quantity) {
      if (!key || !Number.isFinite(quantity) || quantity < 0) return;
      let queue = this.lineQueues.get(key);
      if (!queue) {
        queue = { inFlight: false, pending: null };
        this.lineQueues.set(key, queue);
      }
      queue.pending = Math.floor(quantity);
      if (!queue.inFlight) this.runChange(key, queue);
    }

    async runChange(key, queue) {
      if (queue.pending == null) { this.lineQueues.delete(key); return; }
      const quantity = queue.pending;
      queue.pending = null;
      queue.inFlight = true;
      document.querySelectorAll('[data-cart-line]').forEach(line => {
        if (line.dataset.lineKey === key) line.setAttribute('aria-busy', 'true');
      });
      try {
        const response = await this.changeLine(key, quantity);
        await this.applyResponse(response, { announcement: quantity === 0 ? this.message('removed') : this.message('updated') });
        this.clearError();
      } catch (error) {
        this.showError(error.message || this.errorMessage());
        await this.refreshSections();
      } finally {
        queue.inFlight = false;
        if (queue.pending != null) this.runChange(key, queue); else this.lineQueues.delete(key);
      }
    }

    onClick(event) {
      const opener = event.target.closest('[data-cart-drawer-open]');
      if (opener && this.isDrawerEnabled) {
        event.preventDefault();
        document.querySelector('cart-drawer')?.open(opener);
        return;
      }
      const close = event.target.closest('[data-cart-drawer-close]');
      if (close) {
        event.preventDefault();
        close.closest('cart-drawer')?.close();
        return;
      }
      const remove = event.target.closest('[data-cart-remove]');
      if (remove) {
        event.preventDefault();
        this.queueChange(remove.dataset.lineKey, 0);
        return;
      }
      const change = event.target.closest('[data-cart-quantity-change]');
      if (!change) return;
      const line = change.closest('[data-cart-line]');
      const input = line?.querySelector('[data-cart-quantity-input]');
      if (!input) return;
      const next = Math.max(0, (Number(input.value) || 0) + Number(change.dataset.cartQuantityChange));
      input.value = String(next);
      this.queueChange(line.dataset.lineKey, next);
    }

    onChange(event) {
      const input = event.target.closest('[data-cart-quantity-input]');
      if (!input) return;
      const key = input.dataset.lineKey;
      const quantity = Math.max(0, Number(input.value) || 0);
      input.value = String(Math.floor(quantity));
      clearTimeout(this.inputTimers.get(key));
      this.inputTimers.set(key, setTimeout(() => {
        this.inputTimers.delete(key);
        this.queueChange(key, quantity);
      }, 250));
    }

    announce(message) {
      if (!message) return;
      document.querySelectorAll('[data-cart-status]').forEach(status => { status.textContent = message; });
    }
    showError(message) {
      document.querySelectorAll('[data-cart-error]').forEach(error => { error.textContent = message; error.hidden = false; });
    }
    clearError() {
      document.querySelectorAll('[data-cart-error]').forEach(error => { error.textContent = ''; error.hidden = true; });
    }
    errorMessage() { return this.config?.dataset.errorMessage || 'Cart update failed'; }
    message(kind) { return this.config?.dataset[`${kind}Message`] || ''; }
  }

  class CartDrawer extends HTMLElement {
    connectedCallback() {
      this.abortController?.abort();
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      this.dialog = this.querySelector('[data-cart-drawer-dialog]');
      if (!this.dialog) return;
      this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(); }, { signal });
      this.dialog.addEventListener('click', event => {
        if (event.target !== this.dialog) return;
        const rect = this.dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.close();
      }, { signal });
      this.dialog.addEventListener('close', () => this.restoreFocus(), { signal });
    }
    disconnectedCallback() { this.abortController?.abort(); }
    open(trigger) {
      if (!this.dialog || this.dialog.open) return;
      this.restoreTarget = trigger;
      this.dialog.showModal();
      requestAnimationFrame(() => this.querySelector('[data-cart-drawer-close]')?.focus());
    }
    close() { if (this.dialog?.open) this.dialog.close(); }
    restoreFocus() {
      const target = this.restoreTarget?.isConnected ? this.restoreTarget : document.querySelector('[data-cart-drawer-open]');
      target?.focus();
    }
  }

  if (!customElements.get('cart-drawer')) customElements.define('cart-drawer', CartDrawer);
  window.SalamCartController = CartController;
  window.SalamCartDrawer = CartDrawer;
  window.SalamCart = new CartController();
  window.SalamCartRequestError = CartRequestError;
})();
