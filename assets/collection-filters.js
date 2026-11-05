(() => {
class SalamCollectionFilterDrawer extends HTMLElement {
  connectedCallback() {
    if (this.controller) return;
    this.details = this.querySelector('details');
    this.summary = this.querySelector('summary');
    this.panel = this.querySelector('[data-filter-panel]');
    this.closeButtons = [...this.querySelectorAll('[data-filter-close]')];
    if (!this.details || !this.summary || !this.panel) return;

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.setAttribute('data-enhanced', '');
    this.details.addEventListener('toggle', () => this.onToggle(), options);
    this.closeButtons.forEach(button => button.addEventListener('click', () => this.close(), options));
    this.addEventListener('keydown', event => this.onKeydown(event), options);
    window.matchMedia?.('(min-width: 64rem)').addEventListener('change', event => {
      if (event.matches) this.close();
    }, options);
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.controller = null;
    this.panel?.setAttribute('aria-modal', 'false');
    this.restoreBackground();
    document.body.removeAttribute('data-filter-drawer-open');
  }

  onToggle() {
    if (this.details.open) {
      this.previousFocus = document.activeElement;
      this.panel.setAttribute('aria-modal', 'true');
      document.body.setAttribute('data-filter-drawer-open', '');
      this.restoreBackground();
      this.background = [];
      for (let branch = this; branch.parentElement && branch !== document.body; branch = branch.parentElement) {
        for (const sibling of branch.parentElement.children) {
          if (sibling === branch || sibling.inert) continue;
          sibling.inert = true;
          this.background.push(sibling);
        }
      }
      requestAnimationFrame(() => this.querySelector('[data-filter-close-button]')?.focus());
    } else {
      this.panel.setAttribute('aria-modal', 'false');
      this.restoreBackground();
      document.body.removeAttribute('data-filter-drawer-open');
      if (this.previousFocus instanceof HTMLElement) this.previousFocus.focus();
      this.previousFocus = null;
    }
  }

  restoreBackground() {
    for (const element of this.background || []) element.inert = false;
    this.background = [];
  }

  close() {
    if (this.details.open) this.details.open = false;
  }

  onKeydown(event) {
    if (!this.details.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [...this.panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.hidden && element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

if ('customElements' in window && !customElements.get('collection-filter-drawer')) {
  customElements.define('collection-filter-drawer', SalamCollectionFilterDrawer);
}

if (typeof module !== 'undefined') module.exports = { SalamCollectionFilterDrawer };
})();
