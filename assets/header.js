/* Native disclosures and dialog provide navigation without a framework. */
if (!customElements.get("salam-header")) {
  customElements.define(
    "salam-header",
    class extends HTMLElement {
      connectedCallback() {
        if (this.events) return;
        this.events = new AbortController();
        const { signal } = this.events;
        this.dialog = this.querySelector("[data-drawer]");
        this.opener = this.querySelector("[data-drawer-open]");
        this.desktop = this.querySelector("[data-desktop-nav]");
        this.breakpoint = matchMedia("(min-width: 64rem)");
        this.restoreFocus = true;
        this.opener?.setAttribute("aria-expanded", "false");

        if (this.dialog && typeof this.dialog.showModal === "function") {
          this.setAttribute("data-enhanced", "");
          this.opener.hidden = false;
          this.opener.addEventListener("click", () => this.openDrawer(), {
            signal,
          });
          this.querySelector("[data-drawer-close]").addEventListener(
            "click",
            () => this.closeDrawer(),
            { signal },
          );
          this.dialog.addEventListener(
            "cancel",
            (event) => {
              event.preventDefault();
              this.closeDrawer();
            },
            { signal },
          );
          this.dialog.addEventListener(
            "close",
            () => {
              this.opener.setAttribute("aria-expanded", "false");
              this.closeBranches(this.dialog);
              if (this.restoreFocus && this.isConnected) this.opener.focus();
            },
            { signal },
          );
          this.dialog.addEventListener(
            "click",
            (event) => {
              if (event.target !== this.dialog) return;
              const rect = this.dialog.getBoundingClientRect();
              if (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
              )
                this.closeDrawer();
            },
            { signal },
          );
        }

        this.querySelectorAll(".header-menu-branch").forEach((branch) => {
          const summary = branch.querySelector("summary");
          summary.setAttribute("aria-expanded", String(branch.open));
          branch.addEventListener(
            "toggle",
            () => {
              summary.setAttribute("aria-expanded", String(branch.open));
              if (branch.open) {
                for (const item of branch.parentElement.parentElement
                  .children) {
                  const sibling = item.querySelector(":scope > details");
                  if (sibling && sibling !== branch) sibling.open = false;
                }
              } else this.closeBranches(branch);
            },
            { signal },
          );
        });

        this.addEventListener(
          "keydown",
          (event) => {
            const branch = event.target.closest(".header-menu-branch[open]");
            if (event.key === "Escape" && branch) {
              event.preventDefault();
              event.stopPropagation();
              branch.open = false;
              branch.querySelector("summary").focus();
            } else if (
              event.key === "ArrowDown" &&
              event.target.matches("summary")
            ) {
              const details = event.target.parentElement;
              if (!details.matches(".header-menu-branch")) return;
              event.preventDefault();
              details.open = true;
              details.querySelector("a")?.focus();
            }
          },
          { signal },
        );
        document.addEventListener(
          "click",
          (event) => {
            if (this.desktop && !this.desktop.contains(event.target))
              this.closeBranches(this.desktop);
          },
          { signal },
        );
        document.addEventListener(
          "focusin",
          (event) => {
            if (!this.desktop) return;
            for (const branch of this.desktop.querySelectorAll(
              ".header-menu-root > li > details[open]",
            )) {
              if (!branch.contains(event.target)) branch.open = false;
            }
          },
          { signal },
        );
        this.breakpoint.addEventListener(
          "change",
          () => {
            const drawerHadFocus = this.dialog?.contains(
              document.activeElement,
            );
            this.closeDrawer(false);
            this.closeBranches(this.desktop);
            if (drawerHadFocus) this.querySelector(".header-brand").focus();
          },
          { signal },
        );
      }

      openDrawer() {
        if (this.breakpoint.matches || this.dialog.open) return;
        this.restoreFocus = true;
        this.closeBranches(this.desktop);
        this.dialog.showModal();
        this.opener.setAttribute("aria-expanded", "true");
        this.querySelector("[data-drawer-close]").focus();
      }

      closeDrawer(restoreFocus = true) {
        this.restoreFocus = restoreFocus;
        if (this.dialog?.open) this.dialog.close();
      }

      closeBranches(container) {
        container?.querySelectorAll("details[open]").forEach((branch) => {
          branch.open = false;
        });
      }

      disconnectedCallback() {
        this.closeDrawer(false);
        this.events?.abort();
        this.events = null;
      }
    },
  );
}
