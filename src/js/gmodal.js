import Util from './util';

const SELECTORS = {
  modalContainer: '.gmodal__container',
  modalDialog: '.gmodal__dialog',
  modalDismiss: '[data-gmodal="dismiss"]'
};

const CLASSESS = {
  open: 'gmodal-open',
  show: 'is-shown',
  hidden: 'is-hidden',
  hasAnimate: 'has-animate',
  backdrop: 'gmodal-backdrop'
};

const DEFAULTS = {
  stickySelectors: [],
  animation: true,
  backdrop: true,
  closeBackdrop: true,
  keyboard: true
};

const FOCUS_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])'
].join(',');

class Gmodal {
  static modals = [];

  constructor(el, options = {}) {
    if (!el) return false;

    if (typeof el === 'string') {
      this._modal = document.querySelector(el);
    } else {
      this._modal = el;
    }

    if (!(this._modal instanceof Element)) {
      return false;
    }

    // if the instance exists, then return it
    if (this._modal.instance) {
      return this._modal.instance;
    }

    this._modal.instance = this;
    this._modal.tabIndex = '-1';

    this._isOpen = false;
    this._isTransitiong = false;
    this._settings = {
      ...DEFAULTS,
      ...options
    };
    this._transitionEndEvent = Util.transitionEnd();
    this._init();
  }

  get element() {
    return this._modal;
  }

  get modalsLength() {
    return Gmodal.modals.length;
  }

  _init() {
    this._body = document.body;
    this._modalContainer = this._modal.querySelector(SELECTORS.modalContainer);
    this._modalDialog = this._modal.querySelector(SELECTORS.modalDialog);
    this._modalDismiss = Array.prototype.slice.call(this._modal.querySelectorAll(SELECTORS.modalDismiss));

    this._scrollbarWidth = 0;

    if (this._settings.animation) {
      this._modal.classList.add(CLASSESS.hasAnimate);
    }

    this._observerCallback = this._observerCallback.bind(this);
    this._observer = new MutationObserver(this._observerCallback);
    this._observer.observe(this._modalDialog, {
      childList: true,
      subtree: true,
      attributes: true
    });

    this._attachEvents();
  }

  _observerCallback(mutations) {
    const mutationRecord = mutations[0];
    const hasRecords =
      mutationRecord.addedNodes.length ||
      mutationRecord.removedNodes.length ||
      mutationRecord.type === 'attributes';

    hasRecords && this._focusable();
  }

  _stickySelectorsArray() {
    if (!Array.isArray(this._settings.stickySelectors)) return [];

    // if there is an option with floating selectors, then we make one a flat array
    return this._settings.stickySelectors.reduce((accum, current) => {
      const els = Array.prototype.slice.call(document.querySelectorAll(current));
      accum.push(...els);
      return accum;
    }, []);
  }

  _attachEvents() {
    this._closeHandler = e => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    };
    this._clickOutside = e => {
      if (this._ignoreBackdropClick) {
        this._ignoreBackdropClick = false;
        return;
      }
      if (!this._modalDialog.contains(e.target)) {
        this.close();
      }
    };
    this._dialogMouseDown = () => {
      const onMouseUp = (e) => {
        this._modal.removeEventListener('mouseup', onMouseUp);
        if (e.target === this._modal) {
          this._ignoreBackdropClick = true;
        }
      };
      this._modal.addEventListener('mouseup', onMouseUp);
    };

    this._modalDismiss.forEach(dismiss => {
      dismiss.addEventListener('click', this._closeHandler);
    });

    if (this._settings.closeBackdrop) {
      this._modal.addEventListener('click', this._clickOutside);
      this._modalDialog.addEventListener('mousedown', this._dialogMouseDown);
    }

    if (this._settings.keyboard) {
      this._keyHandler = this._keyHandler.bind(this);
      this._modal.addEventListener('keydown', this._keyHandler);
    }
  }

  _dettachEvents() {
    if (this._settings.closeBackdrop) {
      this._modal.removeEventListener('click', this._clickOutside);
      this._modalDialog.removeEventListener('mousedown', this._dialogMouseDown);
    }
    this._modalDismiss.forEach(dismiss => {
      dismiss.removeEventListener('click', this._closeHandler);
    });

    if (this._settings.keyboard) {
      this._modal.removeEventListener('keydown', this._keyHandler);
    }
  }

  _focusable() {
    this._focusableEls = Array.prototype.slice.call(
      this._modal.querySelectorAll(FOCUS_SELECTORS)
    )
      .filter(el => Util.isVisible(el));

    this._focusableElFirst = this._focusableEls[0];
    this._focusableElLast = this._focusableEls[this._focusableEls.length - 1];
  }

  _keyHandler(e) {
    const ESC = 27;
    const TAB = 9;
    const focusPrev = () => {
      if (document.activeElement === this._focusableElFirst || document.activeElement === this._modal) {
        e.preventDefault();
        this._focusableElLast.focus();
      }
    };
    const focusNext = () => {
      if (document.activeElement === this._focusableElLast) {
        e.preventDefault();
        this._focusableElFirst.focus();
      }
    };
    switch (e.which) {
      case TAB:
        if (this._focusableEls.length === 0) {
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

  _createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = CLASSESS.backdrop;
    if (this._settings.animation) {
      backdrop.className += ` ${CLASSESS.hasAnimate}`;
    }
    document.body.appendChild(backdrop);
    return backdrop;
  }

  _setScrollOffset() {
    if (!this._hasScrollbar) return;

    this._scrollbarWidth = Util.getScrollbarWidth();

    const actualPadding = this._body.style.paddingRight;
    const calculatedPadding = parseFloat(getComputedStyle(this._body).paddingRight);
    actualPadding && this._body.setAttribute('data-gmodal-padding', actualPadding);
    this._body.style.paddingRight = `${calculatedPadding + this._scrollbarWidth}px`;

    this._stickySelectorsArray().forEach(el => {
      const actualMargin = el.style.marginRight;
      const calculatedMargin = parseFloat(getComputedStyle(el).marginRight);
      actualMargin && el.setAttribute('data-gmodal-margin', actualMargin);
      el.style.marginRight = `${calculatedMargin + this._scrollbarWidth}px`;
    });
  }

  _resetScrollOffset() {
    if (!this._hasScrollbar) return;

    this._body.style.paddingRight = this._body.getAttribute('data-gmodal-padding') || '';
    this._body.removeAttribute('data-gmodal-padding');

    this._stickySelectorsArray().forEach(el => {
      el.style.marginRight = el.getAttribute('data-gmodal-margin') || '';
      el.removeAttribute('data-gmodal-margin');
    });
  }

  _adjustModal() {
    this._scrollbarWidth = Util.getScrollbarWidth();
    this._modal.style.overflow = 'hidden';
    this._modal.style.marginRight = `${this._scrollbarWidth}px`;
  }

  _resetAdjustModal() {
    this._modal.style.overflow = '';
    this._modal.style.marginRight = '';
  }

  _hideBackdrop() {
    if (!this._backdrop) return;

    this._backdrop.classList.remove(CLASSESS.show);

    if (this._settings.animation) {
      const duration = Util.getTransitionDurationFromElement(this._backdrop);

      Util.onceTransitionEnd(this._backdrop, this._transitionEndEvent, () => {
        if (this._backdrop?.parentNode) {
          this._backdrop.parentNode?.removeChild(this._backdrop);
        }
      });
      Util.emulateTransitionEnd(this._backdrop, duration);
    } else {
      this._backdrop.parentNode && this._backdrop.parentNode.removeChild(this._backdrop);
    }
  }

  _hideModal() {
    // if single modal window
    if (this.modalsLength === 1) {
      this._body.classList.remove(CLASSESS.open);
      this._resetScrollOffset();
    }
    this._modal.style.display = '';
    this._isTransitiong = false;

    if (this.modalsLength) {
      const { focusEl } = Gmodal.modals[this.modalsLength - 1];
      setTimeout(() => {
        // return focus to the document
        focusEl?.focus();
      }, 0);
    }

    // remove the last modal instance from the array
    Gmodal.modals.pop();
    // if there are still modal instances in the array
    // display the previous modal
    if (this.modalsLength) {
      const modal = Gmodal.modals[this.modalsLength - 1].item;
      modal.element.classList.remove(CLASSESS.hidden);
    }

    // if the method was called from destroy method
    // trigger an event only if the modal was open at that moment
    if (this._isOpen) {
      Util.customTrigger('gmodal:close', this._modal);
    }

    this._isOpen = false;
  }

  open() {
    if (!this._modal) return;

    if (this._isOpen || this._isTransitiong) return;

    this._isOpen = true;
    this._focusableSave = document.activeElement;

    // if single modal window
    if (!this.modalsLength) {
      this._hasScrollbar = Util.checkScrollbar();
      this._body.classList.add(CLASSESS.open);
      this._setScrollOffset();

      if (this._settings.backdrop) {
        this._backdrop = this._createBackdrop(this);
      }
    }

    Util.customTrigger('gmodal:beforeopen', this._modal);
    this._modal.style.display = 'block';

    this._isTransitiong = true;
    this._modal.scrollTop = 0;

    // if there are modals instances hide the previous ones
    if (this.modalsLength) {
      Gmodal.modals.forEach(modal => {
        modal.item.element.classList.add(CLASSESS.hidden);
      });
    }
    // add a new modal instance to the array
    Gmodal.modals.push({
      item: this._modal.instance,
      focusEl: this._focusableSave
    });

    setTimeout(() => {
      if (this._backdrop) {
        this._backdrop.classList.add(CLASSESS.show);
      }
      this._modal.classList.add(CLASSESS.show);
    }, 20);

    const opened = () => {
      this._isTransitiong = false;
      this._focusable();
      this._modal.focus();
      Util.customTrigger('gmodal:open', this._modal);
    };

    if (this._settings.animation) {
      this._adjustModal();

      const duration = Util.getTransitionDurationFromElement(this._modalContainer);

      Util.onceTransitionEnd(this._modalContainer, this._transitionEndEvent, () => {
        this._resetAdjustModal();
        opened();
      });
      Util.emulateTransitionEnd(this._modalContainer, duration);
    } else {
      opened();
    }
  }

  close(forceClose = false) {
    if (!this._modal) return;

    if (!this._isOpen || this._isTransitiong) return;

    Util.customTrigger('gmodal:beforeclose', this._modal);
    this._modal.classList.remove(CLASSESS.show);
    this._hideBackdrop();

    this._isTransitiong = true;

    if (this._settings.animation && !forceClose) {
      const duration = Util.getTransitionDurationFromElement(this._modalContainer);
      Util.onceTransitionEnd(this._modalContainer, this._transitionEndEvent, this._hideModal.bind(this));
      Util.emulateTransitionEnd(this._modalContainer, duration);
    } else {
      this._hideModal();
    }
  }

  static closeAll() {
    if (!this.modals.length) return;
    let forceClose = false;

    // keep activeFocus and scrolling parameters from the first modal window
    const { _hasScrollbar } = this.modals[0].item;

    // when all modals are closed, expand our array
    // so that the last instance becomes the first
    this.modals
      .slice()
      .reverse()
      .forEach((modal, index) => {
        if (index === 0) {
          // for the modal in the foreground
          // overwrite the _hasScrollbar value from the first modal
          modal.item._hasScrollbar = _hasScrollbar;
        } else {
          // to instantly hide modals in the background use a forceClose flag
          forceClose = true;
        }
        // hide all modals
        modal.item.close(forceClose);
      });
  }

  destroy() {
    if (!this._modal) return;

    // forcing isOpen state to false
    // close event should not be fired in the hideModal method
    this._isOpen = false;

    this._observer && this._observer.disconnect();

    // If backdrop and modal active
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._hideModal();
    this._modal.classList.remove(CLASSESS.hasAnimate, CLASSESS.show);

    this._dettachEvents();

    delete this._modal.instance;
    Object.keys(this).forEach(item => {
      delete this[item];
    });
  }
}

export default Gmodal;
