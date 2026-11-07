(() => {
  class ProductMedia extends HTMLElement {
    connectedCallback() {
      this.abortController?.abort();
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
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
      if (moveFocus) this.querySelector(`[data-media-thumbnail="${CSS.escape(id)}"]`)?.focus();
    }
  }

  class ProductDetails extends HTMLElement {
    connectedCallback() {
      this.abortController?.abort();
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      this.querySelectorAll('[data-option-group]').forEach(group => {
        const options = [...group.querySelectorAll('.product-option__value')];
        const links = options.filter(option => option.hasAttribute('href'));
        const tabStop = links.find(option => option.classList.contains('is-selected')) || links[0];
        group.setAttribute('role', 'radiogroup');
        for (const option of options) {
          option.parentElement.setAttribute('role', 'presentation');
          option.setAttribute('role', 'radio');
          option.setAttribute('aria-checked', String(option.classList.contains('is-selected')));
          option.removeAttribute('aria-current');
        }
        for (const link of links) {
          link.tabIndex = link === tabStop ? 0 : -1;
          link.addEventListener('click', event => this.onOptionClick(event), { signal });
          link.addEventListener('keydown', event => this.onOptionKey(event, links), { signal });
        }
      });
      this.addLabel = this.querySelector('[data-add-to-cart-text]')?.textContent;
      this.querySelectorAll('[data-quantity-change]').forEach(button => button.addEventListener('click', () => this.changeQuantity(button), { signal }));
      this.querySelector('form')?.addEventListener('submit', event => this.onSubmit(event), { signal });
      this.setupStickyBar();
      this.setupStickyInformation();
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.variantRequest?.abort();
      this.stickyObserver?.disconnect();
      this.informationObserver?.disconnect();
      window.clearTimeout(this.addedTimeout);
    }

    onOptionKey(event, links) {
      const option = event.currentTarget;
      if (event.key === ' ') {
        event.preventDefault();
        option.click();
        return;
      }
      const rtl = getComputedStyle(option).direction === 'rtl';
      const steps = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -1, ArrowDown: 1 };
      const step = steps[event.key];
      if (!step) return;
      event.preventDefault();
      const next = links[(links.indexOf(option) + step + links.length) % links.length];
      next.focus();
      next.click();
    }

    async onOptionClick(event) {
      const option = event.currentTarget;
      if (!option.href) return;
      event.preventDefault();
      if (this.adding) return;
      const selectors = option.closest('[data-option-selectors]');
      const currentGroup = option.closest('[data-option-group]');
      const selected = [...selectors.querySelectorAll('[data-option-group]')].map(group =>
        group === currentGroup ? option : group.querySelector('[data-option-value-id][aria-checked="true"]')
      );
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

    async onSubmit(event) {
      if (!event.currentTarget.checkValidity()) return;
      const submitter = event.submitter;
      if (!submitter?.matches('[data-add-to-cart]')) return;
      if (this.hasAttribute('aria-busy')) {
        event.preventDefault();
        return;
      }
      const form = event.currentTarget;
      const buttons = this.querySelectorAll('[data-add-to-cart]');
      if (this.ajaxDisabled || !window.SalamCart?.isDrawerEnabled) {
        buttons.forEach(button => { button.disabled = true; });
        this.setAttribute('aria-busy', 'true');
        return;
      }
      event.preventDefault();
      if (this.adding) return;
      this.adding = true;
      const error = this.querySelector('[data-product-cart-error]');
      const status = this.querySelector('[data-product-cart-status]');
      const text = this.querySelector('[data-add-to-cart-text]');
      window.clearTimeout(this.addedTimeout);
      const loadingLabel = this.querySelector('[data-loading-label]')?.dataset.loadingLabel;
      if (text && loadingLabel) text.textContent = loadingLabel;
      if (error) { error.hidden = true; error.textContent = ''; }
      if (status) status.textContent = '';
      buttons.forEach(button => { button.disabled = true; });
      this.setAttribute('aria-busy', 'true');
      try {
        await window.SalamCart.addProduct(form);
        const label = submitter.dataset.addedLabel || this.querySelector('[data-add-to-cart]')?.dataset.addedLabel;
        if (text && label) text.textContent = label;
        if (status && label) status.textContent = label;
        this.addedTimeout = window.setTimeout(() => { if (text) text.textContent = this.addLabel; }, 1800);
      } catch (requestError) {
        if (text) text.textContent = this.addLabel;
        const fallback = submitter.dataset.errorLabel || this.querySelector('[data-add-to-cart]')?.dataset.errorLabel || requestError.message;
        if (error) { error.textContent = requestError.message || fallback; error.hidden = false; }
        if (!requestError.serverResponse) this.ajaxDisabled = true;
      } finally {
        this.adding = false;
        buttons.forEach(button => { button.disabled = false; });
        this.removeAttribute('aria-busy');
      }
    }

    setupStickyInformation() {
      const information = this.querySelector('.product-page__information--sticky');
      if (!information || !('ResizeObserver' in window)) return;
      const update = () => {
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
        const spacing = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const fits = window.matchMedia('(min-width: 64rem)').matches && information.getBoundingClientRect().height <= window.innerHeight - header - spacing * 2;
        information.toggleAttribute('data-sticky-fit', fits);
      };
      this.informationObserver = new ResizeObserver(update);
      this.informationObserver.observe(information);
      const header = document.querySelector('.shopify-section-group-header-group');
      if (header) this.informationObserver.observe(header);
      window.addEventListener('resize', update, { signal: this.abortController.signal });
      update();
    }

    setupStickyBar() {
      const bar = this.querySelector('[data-sticky-buy]');
      const addButton = this.querySelector('[data-add-to-cart]');
      if (!bar || !addButton || !('IntersectionObserver' in window)) return;
      this.stickyObserver = new IntersectionObserver(([entry]) => {
        bar.hidden = entry.isIntersecting || entry.boundingClientRect.bottom > (entry.rootBounds?.top ?? 0);
      }, { threshold: 0.1 });
      this.stickyObserver.observe(addButton);
    }
  }

  if (!customElements.get('product-media')) customElements.define('product-media', ProductMedia);
  if (!customElements.get('product-details')) customElements.define('product-details', ProductDetails);
})();
