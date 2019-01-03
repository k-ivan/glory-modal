import Util from './util';

const SELECTORS = {
  modalDialog: '.modal__dialog',
  modalContent: '.modal__content',
  modalBody: '.modal__body',
  modalDismiss: '[data-modal="dismiss"]'
}

const CLASSESS = {
  open: 'modal-open',
  show: 'is-show',
  hasAnimate: 'has-animate',
  backdrop: 'modal-backdrop'
}

const DEFAULTS = {
  stickySelectors: [],
  animation: true,
  backdrop: true,
  closeBackdrop: true,
  keyboard: true
}

class Modal {
  constructor(el, options = {}) {
    if (!el) return false;

    if (typeof el === 'string') {
      this.modal = document.querySelector(el);
    } else {
      this.modal = el;
    }

    if (!(this.modal instanceof Element)) {
      return false;
    }

    // if the instance exists, then return it
    if (this.modal.instance) {
      return this.modal.instance;
    }

    this.modal.instance = this;
    this.modal.tabIndex = '-1';

    this.isOpen = false;
    this.isTransitiong = false;
    // this.settings = Object.assign({}, DEFAULTS, options);
    this.settings = {
      ...DEFAULTS,
      ...options
    }
    this.transitionEndEvent = Util.transitionEnd();
    this.init();
  }

  init() {
    this.body = document.body;
    this.modalDialog = this.modal.querySelector(SELECTORS.modalDialog);
    this.modalContent = this.modal.querySelector(SELECTORS.modalContent);
    this.modalBody = this.modal.querySelector(SELECTORS.modalBody);
    this.modalDismiss = Array.prototype.slice.call(this.modal.querySelectorAll(SELECTORS.modalDismiss));

    this.scrollbarWidth = 0;

    if (this.settings.animation) {
      this.modal.classList.add(CLASSESS.hasAnimate);
    }

    this._focusable();
    this._attachEvents();
  }

  get element() {
    return this.modal;
  }

  _attachEvents() {
    this.closeHandler = e => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    };
    this.clickModal = e => {
      e.preventDefault();
      if (!this.modalContent.contains(e.target)) {
        this.close();
      }
    };

    this.modalDismiss.forEach(dismiss => {
      dismiss.addEventListener('click', this.closeHandler);
    });

    if (this.settings.closeBackdrop) {
      this.modal.addEventListener('click', this.clickModal);
    }

    if (this.settings.keyboard) {
      this.keyHandler = this._keyHandler.bind(this);
      this.modal.addEventListener('keydown', this.keyHandler);
    }
  }

  _dettachEvents() {
    if (this.settings.closeBackdrop) {
      this.modal.removeEventListener('click', this.clickModal);
    }
    this.modalDismiss.forEach(dismiss => {
      dismiss.removeEventListener('click', this.closeHandler);
    });

    if (this.settings.keyboard) {
      this.modal.removeEventListener('keydown', this.keyHandler);
    }
  }

  _focusable() {
    this.focusableEls = Array.prototype.slice.call(
      this.modal.querySelectorAll(
        `a[href],
        area[href],
        input:not([disabled]):not([type="hidden"]):not([aria-hidden]),
        select:not([disabled]):not([aria-hidden]),
        textarea:not([disabled]):not([aria-hidden]),
        button:not([disabled]):not([aria-hidden]),
        iframe,
        object,
        embed,
        [contenteditable],
        [tabindex]:not([tabindex^="-"])`
      )
    )
    this.focusableElFirst = this.focusableEls[0];
    this.focusableElLast = this.focusableEls[this.focusableEls.length - 1];
  }

  _keyHandler(e) {
    const ESC = 27;
    const TAB = 9;
    const focusPrev = () => {
      console.log(document.activeElement);

      if (document.activeElement === this.focusableElFirst || document.activeElement === this.modal) {
        e.preventDefault();
        this.focusableElLast.focus();
      }
    };
    const focusNext = () => {
      if (document.activeElement === this.focusableElLast) {
        e.preventDefault();
        this.focusableElFirst.focus();
      }
    };
    switch (e.which) {
      case TAB:
        if (this.focusableEls.length === 0) {
          e.preventDefault();
          break;
        }
        if (e.shiftKey) {
          focusPrev();
        } else {
          focusNext();
        }
        break;
      case ESC:
        e.stopPropagation();
        this.close();
        break;
      default:
        break;
    }
  }

  _checkScrollbar() {
    return window.innerWidth > document.documentElement.clientWidth;
  }

  _getScrollbarWidth() {
    // return window.innerWidth - document.documentElement.clientWidth;

    // Create the measurement node
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = `
      width: 100px;
      height: 100px;
      overflow: scroll;
      position: absolute;
      top: -9999px;
    `;
    document.body.appendChild(scrollDiv);

    // Get the scrollbar width
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    // Delete the DIV
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  _createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = CLASSESS.backdrop;
    if (this.settings.animation) {
      backdrop.className += ` ${CLASSESS.hasAnimate}`;
    }
    document.body.appendChild(backdrop);
    return backdrop;
  }

  _setScrollOffset() {
    this.hasScrollbar = this._checkScrollbar();
    this.body.classList.add(CLASSESS.open);

    if (!this.hasScrollbar) return;

    this.scrollbarWidth = this._getScrollbarWidth();

    const actualMargin = this.body.style['margin-right'];
    const calculatedMargin = parseFloat(getComputedStyle(this.body)['margin-right']);
    this.body.setAttribute('data-modal-margin', actualMargin);
    this.body.style['margin-right'] = `${calculatedMargin + this.scrollbarWidth}px`;

    this.settings.stickySelectors.forEach(selector => {
      this.stickySelectors = Array.prototype.slice.call(document.querySelectorAll(selector));
      this.stickySelectors.forEach(el => {
        const actualMargin = el.style['margin-right'];
        const calculatedMargin = parseFloat(getComputedStyle(el)['margin-right']);
        el.setAttribute('data-modal-margin', actualMargin);
        el.style['margin-right'] = `${calculatedMargin + this.scrollbarWidth}px`;
      });
    });
  }

  _resetScrollOffset() {
    this.body.classList.remove(CLASSESS.open);

    if (!this.hasScrollbar) return;

    this.body.style['margin-right'] = this.body.getAttribute('data-modal-margin') || '';
    this.body.removeAttribute('data-modal-margin');

    if (this.stickySelectors && Array.isArray(this.stickySelectors)) {
      this.stickySelectors.forEach(el => {
        el.style['margin-right'] = el.getAttribute('data-modal-margin') || '';
        el.removeAttribute('data-modal-margin');
      });
    }
  }

  _adjustModal() {
    this.scrollbarWidth = this._getScrollbarWidth();
    this.modal.style.overflow = 'hidden';
    this.modal.style.marginRight = `${this.scrollbarWidth}px`;
  }

  _resetAdjustModal() {
    this.modal.style.overflow = '';
    this.modal.style.marginRight = '';
  }

  open() {
    if (!this.modal) return;

    if (this.isOpen || this.isTransitiong) return;

    this.isOpen = true;
    this.focusableSave = document.activeElement;

    this._setScrollOffset();

    if (this.settings.backdrop) {
      this.backdrop = this._createBackdrop(this);
    }
    this.modal.style.display = 'block';

    this.isTransitiong = true;
    this.modal.scrollTop = 0;

    setTimeout(() => {
      if (this.backdrop) {
        this.backdrop.classList.add(CLASSESS.show);
      }
      // this.modalDialog.classList.add(CLASSESS.show);
      this.modal.classList.add(CLASSESS.show);
    }, 20);

    if (this.settings.animation) {
      this._adjustModal();

      const duration = Util.getTransitionDurationFromElement(this.modalDialog);

      Util.onceTransitionEnd(this.modalDialog, this.transitionEndEvent, (e) => {
        this.isTransitiong = false;
        this._resetAdjustModal();
        this.modal.focus();
        Util.customTrigger('showModal', this.modal);
      });
      Util.emulateTransitionEnd(this.modalDialog, duration);
    } else {
      this.isTransitiong = false;
      this.modal.focus();
      Util.customTrigger('showModal', this.modal);
    }
  }

  close() {
    if (!this.modal) return;

    if (!this.isOpen || this.isTransitiong) return;

    this.modal.classList.remove(CLASSESS.show);
    this.hideBackdrop();

    this.isOpen = false;
    this.isTransitiong = true;

    if (this.settings.animation) {
      this._adjustModal();
      const duration = Util.getTransitionDurationFromElement(this.modalDialog);
      Util.onceTransitionEnd(this.modalDialog, this.transitionEndEvent, this.hideModal.bind(this));
      Util.emulateTransitionEnd(this.modalDialog, duration);
    } else {
      this.hideModal();
    }
  }

  hideBackdrop() {
    if (!this.backdrop) return;

    this.backdrop.classList.remove(CLASSESS.show);

    if (this.settings.animation) {
      const duration = Util.getTransitionDurationFromElement(this.backdrop);

      Util.onceTransitionEnd(this.backdrop, this.transitionEndEvent, (e) => {
        if (this.backdrop.parentNode) {
          this.backdrop.parentNode.removeChild(this.backdrop);
        }
      });
      Util.emulateTransitionEnd(this.backdrop, duration);
    } else {
      this.backdrop.parentNode && this.backdrop.parentNode.removeChild(this.backdrop);
    }
  }

  hideModal() {
    this._resetScrollOffset();
    this._resetAdjustModal();
    this.modal.style.display = '';
    this.isTransitiong = false;
    if (this.focusableSave) {
      this.focusableSave.focus();
    }

    Util.customTrigger('hideModal', this.modal);
  }

  unobserve() {
    if (!this.modal) return;

    // If backdrop and modal active
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop)
    }
    this.hideModal();
    this.modal.classList.remove(CLASSESS.hasAnimate, CLASSESS.show);

    this._dettachEvents();

    delete this.modal.instance;
    Object.keys(this).forEach(item => {
      delete this[item];
    });
  }
}

export default Modal;
