(() => {
  class ProductMedia extends HTMLElement {
    connectedCallback() {
      this.abortController?.abort();
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      this.track = this.querySelector('[data-media-track]');
      this.querySelectorAll('[data-media-thumbnail]').forEach(thumbnail => {
        thumbnail.addEventListener('click', event => {
          event.preventDefault();
          this.activate(thumbnail.dataset.mediaThumbnail, true);
        }, { signal });
      });
      this.querySelectorAll('[data-media-zoom]').forEach(button => {
        button.addEventListener('click', () => document.getElementById(button.dataset.mediaZoom)?.showModal(), { signal });
      });
      this.querySelectorAll('[data-dialog-close]').forEach(button => {
        button.addEventListener('click', () => button.closest('dialog')?.close(), { signal });
      });
      this.querySelectorAll('dialog').forEach(dialog => {
        dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }, { signal });
      });
      this.dataset.enhanced = 'true';
    }

    disconnectedCallback() { this.abortController?.abort(); }

    activate(id, moveFocus = false) {
      const target = this.querySelector(`[data-media-id="${CSS.escape(id)}"]`);
      if (!target) return;
      this.querySelectorAll('[data-media-id]').forEach(item => {
        const active = item === target;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-hidden', String(!active));
      });
      this.querySelectorAll('[data-media-thumbnail]').forEach(thumbnail => {
        const active = thumbnail.dataset.mediaThumbnail === id;
        thumbnail.classList.toggle('is-active', active);
        if (active) thumbnail.setAttribute('aria-current', 'true'); else thumbnail.removeAttribute('aria-current');
      });
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      if (moveFocus) this.querySelector(`[data-media-thumbnail="${CSS.escape(id)}"]`)?.focus();
    }
  }

  class ProductDetails extends HTMLElement {
    connectedCallback() {
      this.abortController?.abort();
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      this.querySelectorAll('[data-option-value-id]').forEach(option => option.addEventListener('click', event => this.onOptionClick(event), { signal }));
      this.querySelectorAll('[data-quantity-change]').forEach(button => button.addEventListener('click', () => this.changeQuantity(button), { signal }));
      this.querySelector('form')?.addEventListener('submit', event => this.onSubmit(event), { signal });
      this.setupStickyBar();
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.variantRequest?.abort();
      this.stickyObserver?.disconnect();
    }

    async onOptionClick(event) {
      const option = event.currentTarget;
      if (!option.href) return;
      event.preventDefault();
      const selectors = option.closest('[data-option-selectors]');
      const selected = [...selectors.querySelectorAll('[data-option-value-id][aria-current="true"]')];
      const position = [...selectors.children].indexOf(option.closest('.product-option'));
      selected[position] = option;
      const ids = selected.filter(Boolean).map(item => item.dataset.optionValueId);
      const baseUrl = option.dataset.productUrl || this.dataset.productUrl;
      const requestUrl = new URL(baseUrl, window.location.origin);
      requestUrl.searchParams.set('section_id', this.dataset.sectionId);
      requestUrl.searchParams.set('option_values', ids.join(','));
      const quantity = this.querySelector('[name="quantity"]')?.value || '1';
      const focusId = option.dataset.optionValueId;
      this.setAttribute('aria-busy', 'true');
      this.variantRequest?.abort();
      this.variantRequest = new AbortController();
      try {
        const response = await fetch(requestUrl, { signal: this.variantRequest.signal, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!response.ok) throw new Error(`Variant request failed: ${response.status}`);
        const documentFragment = new DOMParser().parseFromString(await response.text(), 'text/html');
        const replacement = documentFragment.querySelector('[data-product-root]');
        if (!replacement) throw new Error('Product section was missing from the response');
        replacement.querySelector('[name="quantity"]')?.setAttribute('value', quantity);
        this.replaceWith(replacement);
        window.history.replaceState({}, '', option.href);
        replacement.querySelector(`[data-option-value-id="${CSS.escape(focusId)}"]`)?.focus();
      } catch (error) {
        if (error.name !== 'AbortError') window.location.assign(option.href);
      }
    }

    changeQuantity(button) {
      const input = this.querySelector('[name="quantity"]');
      if (!input) return;
      const next = Math.max(Number(input.min) || 1, (Number(input.value) || 1) + Number(button.dataset.quantityChange));
      input.value = String(next);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    onSubmit(event) {
      if (!event.currentTarget.checkValidity()) return;
      this.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = true; });
      this.setAttribute('aria-busy', 'true');
    }

    setupStickyBar() {
      const bar = this.querySelector('[data-sticky-buy]');
      const addButton = this.querySelector('[data-add-to-cart]');
      if (!bar || !addButton || !('IntersectionObserver' in window)) return;
      this.stickyObserver = new IntersectionObserver(([entry]) => { bar.hidden = entry.isIntersecting; }, { threshold: 0.1 });
      this.stickyObserver.observe(addButton);
    }
  }

  if (!customElements.get('product-media')) customElements.define('product-media', ProductMedia);
  if (!customElements.get('product-details')) customElements.define('product-details', ProductDetails);
})();
