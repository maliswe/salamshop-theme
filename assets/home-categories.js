/* Native scrolling works without this enhancement. Keep focused links fully
 * visible, including their focus rings, when the browser only reveals part. */
if (!customElements.get('salam-category-track')) {
  customElements.define('salam-category-track', class extends HTMLElement {
    connectedCallback() {
      if (this.events) return;
      this.events = new AbortController();
      this.addEventListener('focusin', event => {
        const card = event.target.closest('.home-category-card');
        if (!card || card.parentElement !== this || this.scrollWidth <= this.clientWidth) return;
        const track = this.getBoundingClientRect();
        const item = card.getBoundingClientRect();
        const inset = parseFloat(getComputedStyle(this).paddingInlineStart) || 0;
        const delta = item.left < track.left + inset
          ? item.left - track.left - inset
          : Math.max(0, item.right - track.right + inset);
        if (delta) this.scrollBy({ left: delta, behavior: 'instant' });
      }, { signal: this.events.signal });
    }

    disconnectedCallback() {
      this.events?.abort();
      this.events = null;
    }
  });
}
