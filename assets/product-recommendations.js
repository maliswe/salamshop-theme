(() => {
  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (!this.dataset.url || this.dataset.loaded === 'true') return;
      this.abortController?.abort();
      this.abortController = new AbortController();
      const load = () => this.load();
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          this.observer.disconnect();
          load();
        }, { rootMargin: '300px 0px' });
        this.observer.observe(this);
      } else load();
    }

    disconnectedCallback() { this.abortController?.abort(); this.observer?.disconnect(); }

    async load() {
      this.dataset.loaded = 'true';
      try {
        const response = await fetch(this.dataset.url, { signal: this.abortController.signal });
        if (!response.ok) return;
        const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
        const replacement = parsed.querySelector('product-recommendations');
        if (replacement?.innerHTML.trim()) {
          this.innerHTML = replacement.innerHTML;
          this.hidden = false;
        }
      } catch (error) {
        if (error.name !== 'AbortError') this.dataset.loaded = 'false';
      }
    }
  }
  if (!customElements.get('product-recommendations')) customElements.define('product-recommendations', ProductRecommendations);
})();
