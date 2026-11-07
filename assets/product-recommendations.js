(() => {
  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      this.actionController?.abort();
      this.actionController = new AbortController();
      this.addEventListener('submit', event => this.onSubmit(event), { signal: this.actionController.signal });
      if (!this.dataset.url || this.dataset.loaded === 'true' || this.loading) return;
      this.observer?.disconnect();
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          this.observer.disconnect();
          this.load();
        }, { rootMargin: '300px 0px' });
        this.observer.observe(this.parentElement || this);
      } else this.load();
    }

    disconnectedCallback() {
      this.actionController?.abort();
      this.abortController?.abort();
      this.observer?.disconnect();
      if (this.loading) this.dataset.loaded = 'false';
      this.loading = false;
    }

    async load() {
      if (this.loading || this.dataset.loaded === 'true') return;
      this.loading = true;
      this.dataset.loaded = 'true';
      this.abortController?.abort();
      const controller = new AbortController();
      this.abortController = controller;
      try {
        const response = await fetch(this.dataset.url, { signal: controller.signal });
        if (!response.ok) return;
        const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
        const replacement = parsed.querySelector('product-recommendations');
        if (controller.signal.aborted || !this.isConnected) return;
        if (replacement?.querySelector('.home-product-card')) {
          this.innerHTML = replacement.innerHTML;
          this.hidden = false;
        }
      } catch (_) {
        // Failed/empty recommendations remain hidden. Never invent products or
        // retry in a loop; a page reload can try the native endpoint again.
      } finally {
        if (this.abortController === controller) this.loading = false;
      }
    }

    async onSubmit(event) {
      const form = event.target.closest('.recommendation-quick-add');
      if (!form || !this.contains(form)) return;
      if (form.dataset.quickAddState === 'busy' || form.dataset.quickAddState === 'uncertain') {
        event.preventDefault();
        return;
      }
      if (!form.checkValidity() || !window.SalamCart?.isDrawerEnabled) return;
      event.preventDefault();
      const button = form.querySelector('[data-quick-add-button]');
      const status = form.querySelector('[data-quick-add-status]');
      const error = form.querySelector('[data-quick-add-error]');
      const recovery = form.querySelector('[data-quick-add-recovery]');
      const label = button.textContent;
      form.dataset.quickAddState = 'busy';
      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      button.textContent = this.dataset.loadingLabel;
      status.textContent = this.dataset.loadingLabel;
      error.hidden = true;
      error.textContent = '';
      recovery.hidden = true;
      try {
        await window.SalamCart.addProduct(form, { trigger: button });
        status.textContent = this.dataset.addedLabel;
        form.dataset.quickAddState = 'idle';
      } catch (requestError) {
        status.textContent = '';
        const uncertain = !requestError.serverResponse;
        form.dataset.quickAddState = uncertain ? 'uncertain' : 'idle';
        error.textContent = uncertain ? this.dataset.uncertainLabel : requestError.message || this.dataset.errorLabel;
        error.hidden = false;
        recovery.hidden = false;
      } finally {
        form.removeAttribute('aria-busy');
        button.textContent = label;
        button.disabled = form.dataset.quickAddState === 'uncertain';
      }
    }
  }
  if (!customElements.get('product-recommendations')) customElements.define('product-recommendations', ProductRecommendations);
})();
