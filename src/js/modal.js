import Util from './util';

const CLASSES = {
  modalOpen: 'modal-open',
  modalDialog: '.modal__dialog',
  modalContent: '.modal__content',
  modalClose: '.modal__close'
}

const DEFAULTS = {
  backdrop: true,
  animation: true,
  stickySelectors: [],
  closeBackdrop: true
}

class Modal {
  constructor(el, opts = {}) {
    if (!el) return false;

    if (typeof el === 'string') {
      this.modal = document.querySelector(el);
    }

    if (!(this.modal instanceof HTMLElement)) {
      return false;
    }

    if (this.modal.isActive) {
      return false;
    }

    this.modal.isActive = true;
    this.modal.tabIndex = '-1';

    this.isOpen = false;
    this.isTransitiong = false;
    this.settings = Object.assign(DEFAULTS, opts);
    this.transitionEndEvent = Util.transitionEnd();
    this.init();
  }

  init() {
    this.body = document.body;
    this.modalDialog = this.modal.querySelector(CLASSES.modalDialog);
    this.modalContent = this.modal.querySelector(CLASSES.modalContent);
    this.modalClose = this.modal.querySelector(CLASSES.modalClose);

    this.focusableEls = Array.prototype.slice.call(
      this.modal.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
      )
    );
    this.focusableElFirst = this.focusableEls[0];
    this.focusableElLast = this.focusableEls[this.focusableEls.length - 1];
    this.modal.focus();

    this.scrollbarWidth = 0;

    if (this.settings.animation) {
      this.modalDialog.classList.add('has-animate');
    }

    this._attachEvents();
  }

  get element() {
    return this.modal;
  }

  _attachEvents() {
    this.closeHandler = e => {
      this.close();
    };
    this.clickModal = e => {
      e.preventDefault();
      if (!this.modalContent.contains(e.target)) {
        this.close();
      }
    };
    this.modalClose.addEventListener('click', this.closeHandler);
    this.modal
      .querySelector('[data-dismiss="modal"]')
      .addEventListener('click', this.closeHandler);

    if (this.settings.closeBackdrop) {
      this.modal.addEventListener('click', this.clickModal);
    }

    this.keyHandler = this._keyHandler.bind(this);
    this.modal.addEventListener('keydown', this.keyHandler);
  }

  _dettachEvents() {
    if (this.settings.closeBackdrop) {
      this.modal.removeEventListener('click', this.clickModal);
    }
    this.modalClose.removeEventListener('click', this.closeHandler);
    this.modal.removeEventListener('keydown', this.keyHandler);
    this.modal
      .querySelector('[data-dismiss="modal"]')
      .removeEventListener('click', this.closeHandler);
  }

  _keyHandler(e) {
    const ESC = 27;
    const TAB = 9;
    const focusPrev = () => {
      if (document.activeElement === this.focusableElFirst) {
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
    backdrop.className = 'modal-backdrop';
    if (this.settings.animation) {
      backdrop.className += ' has-animate';
    }
    document.body.appendChild(backdrop);
    return backdrop;
  }

  _setScrollOffset() {
    this.hasScrollbar = this._checkScrollbar();
    this.body.classList.add('modal-open');

    if (!this.hasScrollbar) return;

    this.scrollbarWidth = this._getScrollbarWidth();
    this.body.style['margin-right'] = `${this.scrollbarWidth}px`;

    this.settings.stickySelectors.forEach(selector => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style['margin-right'] = `${this.scrollbarWidth}px`;
    });
  }

  _resetScrollOffset() {
    this.body.classList.remove('modal-open');

    if (!this.hasScrollbar) return;

    this.body.style['margin-right'] = '';
    this.settings.stickySelectors.forEach(selector => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style['margin-right'] = '';
    });
  }

  _adjustModal() {
    this.scrollbarWidth = this._getScrollbarWidth();
    this.modal.classList.add('is-animating');
    this.modal.style.marginRight = `${this.scrollbarWidth}px`;
  }

  _resetAdjustModal() {
    this.modal.classList.remove('is-animating');
    this.modal.style.marginRight = '';
  }

  open() {
    if (this.isOpen || this.isTransitiong) return;

    this.isOpen = true;

    this._setScrollOffset();

    if (this.settings.backdrop) {
      this.backdrop = this._createBackdrop(this);
    }
    this.modal.classList.add('is-open');

    this.isTransitiong = true;
    this.modal.scrollTop = 0;

    setTimeout(() => {
      if (this.backdrop) {
        this.backdrop.classList.add('is-show');
      }
      this.modalDialog.classList.add('is-show');
    }, 20);

    if (this.transitionEndEvent && this.settings.animation) {
      this._adjustModal();

      const duration = Util.getTransitionDurationFromElement(this.modalDialog);

      Util.onceListener(this.modalDialog, this.transitionEndEvent, (e) => {
        this.modal.focus();
        this._resetAdjustModal();
        this.isTransitiong = false;
        Util.customTrigger('showModal', this.modal);
      });
      Util.emulateTransitionEnd(this.modalDialog, duration);
    } else {
      this.modal.focus();
      this.isTransitiong = false;
      Util.customTrigger('showModal', this.modal);
    }
  }

  close(e) {
    if (!this.isOpen || this.isTransitiong) return;

    this.modalDialog.classList.remove('is-show');
    this.hideBackdrop();

    this.isOpen = false;
    this.isTransitiong = true;

    if (this.settings.animation && this.transitionEndEvent) {
      this._adjustModal();

      const duration = Util.getTransitionDurationFromElement(this.modalDialog);
      Util.onceListener(this.modalDialog, this.transitionEndEvent, this.hideModal.bind(this));
      Util.emulateTransitionEnd(this.modalDialog, duration);
    } else {
      this.hideModal();
    }
  }

  hideBackdrop() {
    if (!this.backdrop) return;

    this.backdrop.classList.remove('is-show');

    if (this.settings.animation && this.transitionEndEvent) {
      const duration = Util.getTransitionDurationFromElement(this.backdrop);

      Util.onceListener(this.modalDialog, this.transitionEndEvent, (e) => {
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
    this.modal.classList.remove('is-open');
    this.isTransitiong = false;
    Util.customTrigger('hideModal', this.modal);
  }

  unobserve() {
    if (!this.modal) return;

    this._dettachEvents();
    delete this.modal.isActive;
    Object.keys(this).forEach(item => {
      delete this[item];
    });
  }
}

export default Modal;
