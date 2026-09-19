/* eslint-disable */
// MomentumSlider — faithful JS port of lmgonzalves/momentum-slider (MIT).
//
// Motion contract ("all the momentums"):
//  - The track follows the pointer 1:1 while dragging; past the edges the
//    movement is rubber-banded (bounceCoefficient + dragOutOfBoundsMultiplier).
//  - The last ~100ms of pointer movement becomes the release velocity.
//  - On release the slider throws (velocity * 12) then eases out to the
//    nearest snap over `animDuration` with easeOutQuad (`t * (2 - t)`).
//  - Out-of-range throws elastically bounce back to the closest slide.
//  - Companion sliders passed via `sync` ride along proportionally.
//
// Added on top of the original: `refresh()` (re-measure responsive slide
// sizes) and `destroy()` (remove every listener / stop the rAF loop) so it can
// be safely mounted inside React effects (incl. StrictMode double-invoke).

const DEFAULTS = {
  el: ".ms-container",
  cssClass: "",
  vertical: false,
  multiplier: 1,
  bounceCoefficient: 0.3,
  bounceMax: 100,
  loop: 0,
  interactive: true,
  reverse: false,
  currentIndex: 0,
  animDuration: 500,
  // Autoplay (both off by default; ignored under prefers-reduced-motion):
  //  autoplay   ms between automatic next() steps (hero-style carousel)
  //  autoScroll px/second of continuous drift (marquee-style strip; needs loop)
  //  pauseEl    element whose hover/focus pauses autoplay (default: container)
  //  pauseOnHover  pause while the mouse is over pauseEl (hover devices only)
  //  respectReducedMotion  skip autoplay when the OS asks for reduced motion
  autoplay: 0,
  autoScroll: 0,
  pauseEl: null,
  hoverEl: null, // element for hover-pause (default: pauseEl)
  pauseOnHover: true,
  respectReducedMotion: true,
};

function isStr(value) {
  return typeof value === "string";
}

function isFn(value) {
  return typeof value === "function";
}

function isUnd(value) {
  return typeof value === "undefined";
}

let passiveSupported = null;

function getPassiveSupported() {
  if (passiveSupported !== null) return passiveSupported;
  passiveSupported = false;
  try {
    const options = Object.defineProperty({}, "passive", {
      get() {
        passiveSupported = true;
        return true;
      },
    });
    window.addEventListener("test-passive", null, options);
    window.removeEventListener("test-passive", null, options);
  } catch (err) {
    /* passive events not supported */
  }
  return passiveSupported;
}

function normalizeEvent(ev) {
  if (ev.type === "touchmove" || ev.type === "touchstart" || ev.type === "touchend") {
    const touch = ev.targetTouches[0] || ev.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY, id: touch.identifier };
  }
  return { x: ev.clientX, y: ev.clientY, id: null };
}

// Resist dragging past the edges: the further out, the more it is damped.
function dragOutOfBoundsMultiplier(val) {
  return 0.000005 * val * val + 0.0001 * val + 0.55;
}

// Interpolate a [lowerValue, centerValue, higherValue] triplet by `diff`.
function getCurrentValue(values, diff, lower) {
  const lowerValue = values[0];
  const centerValue = values[1];
  const higherValue = values[2] || lowerValue;
  const diffValue = lower ? centerValue - lowerValue : centerValue - higherValue;
  return lower ? centerValue - diffValue * diff : centerValue + diffValue * diff;
}

function animate(step, duration, easing) {
  if (!duration) {
    step(1);
    return { stop() {} };
  }
  const start = performance.now();
  let timer = null;
  let stopped = false;
  const tick = (now) => {
    let progress = (now - start) / duration;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    if (isFn(easing)) progress = easing(progress);
    step(progress);
    if (progress !== 1 && !stopped) timer = requestAnimationFrame(tick);
  };
  timer = requestAnimationFrame(tick);
  return {
    stop() {
      if (timer) cancelAnimationFrame(timer);
      stopped = true;
    },
  };
}

class MomentumSlider {
  constructor(options) {
    this.o = Object.assign({}, DEFAULTS, options);
    this.lastCurrentIndex = undefined;
    this.initHtml();
    this.initValues();
    this.initEvents();
    this.updateClassnames();
    this.initAutoplay();
  }

  initHtml() {
    this.msContainer = isStr(this.o.el) ? document.querySelector(this.o.el) : this.o.el;
    this.msContainer.classList.add("ms-container--" + (this.o.vertical ? "vertical" : "horizontal"));
    if (this.o.cssClass) this.msContainer.classList.add(this.o.cssClass);
    if (this.o.reverse) this.msContainer.classList.add("ms-container--reverse");

    this.msTrack = this.msContainer.children[0];
    this.msSlides = this.msTrack.children;

    // A previous instance on the same DOM (React StrictMode double-invokes
    // effects) may have left loop clones behind — never clone a clone.
    this.removeClones();

    this.step = this.o.vertical ? this.msSlides[0].scrollHeight : this.msSlides[0].scrollWidth;
    this.sliderLength = this.msSlides.length;

    if (this.o.loop) {
      const loopLength = Math.min(this.o.loop, this.sliderLength);
      this.o.loop = loopLength;
      // Leading clones (tail of the list).
      const leading = document.createDocumentFragment();
      let index = this.sliderLength - loopLength;
      for (let i = 0; i < loopLength; i++) {
        leading.appendChild(this.cloneSlide(this.msSlides[index++]));
      }
      this.msTrack.insertBefore(leading, this.msTrack.firstChild);
      // Trailing clones (head of the list).
      const trailing = document.createDocumentFragment();
      let start = loopLength; // skip the leading clones just inserted
      for (let i = 0; i < loopLength; i++) {
        trailing.appendChild(this.cloneSlide(this.msSlides[start++]));
      }
      this.msTrack.appendChild(trailing);
      this.sliderLength += loopLength * 2;
    }

    this.sliderWidth = this.sliderLength * this.step;
  }

  cloneSlide(node) {
    const clone = node.cloneNode(true);
    clone.setAttribute("data-ms-clone", "");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", ""); // no duplicate tab stops / clicks
    return clone;
  }

  removeClones() {
    const clones = this.msTrack.querySelectorAll(":scope > [data-ms-clone]");
    for (let i = clones.length - 1; i >= 0; i--) clones[i].remove();
  }

  initValues() {
    this.boundMin = this.o.reverse ? 0 : -this.step * (this.sliderLength - 1);
    this.boundMax = this.o.reverse ? this.step * (this.sliderLength - 1) : 0;
    this.targetPosition = 0;
    this.ticking = false;
    this.enabled = true;
    this.pointerActive = false;
    this.pointerMoved = false;
    this.trackingPoints = [];
    this.msTrack.style[this.o.vertical ? "height" : "width"] = this.sliderWidth + "px";
    this.currentIndex = this.o.currentIndex + this.o.loop;
    // Start on the first real slide (past any leading loop clones) before the
    // initial render — otherwise refresh() would snap back to index 0.
    this.targetPosition = (this.o.reverse ? 1 : -1) * this.currentIndex * this.step;
    this.refresh();
  }

  initEvents() {
    this._onDown = this.onDown.bind(this);
    this._onMove = this.onMove.bind(this);
    this._onUp = this.onUp.bind(this);
    this._onCancel = () => this.cancelPointer();
    this._onResize = () => this.refresh();
    // Native HTML5 drag (on <img>/<a> inside slides) swallows mousemove/mouseup,
    // which would leave the slider "held" until the next click. Block it.
    this._onDragStart = (ev) => ev.preventDefault();
    // A click that ends a real drag must not activate links/buttons in slides.
    this._onClick = (ev) => {
      if (this.suppressClick) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    };

    if (this.o.interactive) {
      this.msContainer.addEventListener("touchstart", this._onDown);
      this.msContainer.addEventListener("mousedown", this._onDown);
      this.msContainer.addEventListener("dragstart", this._onDragStart);
      this.msContainer.addEventListener("click", this._onClick, true);
      // Releasing outside the page (alt-tab, devtools) never sends mouseup.
      window.addEventListener("blur", this._onCancel);

      const moveOpts = getPassiveSupported() ? { passive: false } : false;
      document.addEventListener("touchmove", this._onMove, moveOpts);
      document.addEventListener("touchend", this._onUp);
      document.addEventListener("touchcancel", this._onCancel);
      document.addEventListener("mousemove", this._onMove, moveOpts);
      document.addEventListener("mouseup", this._onUp);

      if (this.o.prevEl) {
        this._prevEl = isStr(this.o.prevEl) ? document.querySelector(this.o.prevEl) : this.o.prevEl;
        if (this._prevEl) {
          this._prevHandler = () => this.prev();
          this._prevEl.addEventListener("click", this._prevHandler);
        }
      }
      if (this.o.nextEl) {
        this._nextEl = isStr(this.o.nextEl) ? document.querySelector(this.o.nextEl) : this.o.nextEl;
        if (this._nextEl) {
          this._nextHandler = () => this.next();
          this._nextEl.addEventListener("click", this._nextHandler);
        }
      }
    }

    window.addEventListener("resize", this._onResize);
  }

  updateClassnames() {
    if (this._prevEl) {
      this._prevEl.classList.toggle("ms-first", this.currentIndex === 0);
    }
    if (this._nextEl) {
      this._nextEl.classList.toggle("ms-last", this.currentIndex === this.sliderLength - 1);
    }
  }

  prev() {
    if (this.enabled) {
      this.updateSlider(
        Math.round(this.targetPosition / this.step) * this.step + (this.o.reverse ? -this.step : this.step)
      );
    }
  }

  next() {
    if (this.enabled) {
      this.updateSlider(
        Math.round(this.targetPosition / this.step) * this.step + (this.o.reverse ? this.step : -this.step)
      );
    }
  }

  select(index) {
    if (this.enabled) {
      this.updateSlider((index + this.o.loop) * (this.o.reverse ? this.step : -this.step));
      this.restartAutoplay();
    }
  }

  // ── Autoplay ─────────────────────────────────────────────────────────
  initAutoplay() {
    this.autoplayInterval = this.o.autoplay > 0 ? this.o.autoplay : 0;
    this.autoScrollSpeed = this.o.autoScroll || 0;
    this.autoplayEnabled = false;
    if (!this.autoplayInterval && !this.autoScrollSpeed) return;
    if (
      this.o.respectReducedMotion &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    this.autoHover = false;
    this.autoFocus = false;
    this.autoHidden = document.hidden === true;
    this.autoInView = true;

    const pauseEl = this.o.pauseEl || this.msContainer;
    this._autoPauseEl = pauseEl;
    this._onAutoEnter = () => {
      this.autoHover = true;
      this.syncAutoplay();
    };
    this._onAutoLeave = () => {
      this.autoHover = false;
      this.syncAutoplay();
    };
    this._onAutoFocusIn = (ev) => {
      // Keyboard focus only: a mouse click on a pagination button also focuses
      // it (Chrome/Edge) and must not freeze autoplay until focus leaves.
      let keyboard = true;
      try {
        keyboard = !!(ev.target && ev.target.matches && ev.target.matches(":focus-visible"));
      } catch (err) {
        /* :focus-visible unsupported → treat as keyboard */
      }
      if (!keyboard) return;
      this.autoFocus = true;
      this.syncAutoplay();
    };
    this._onAutoFocusOut = () => {
      this.autoFocus = false;
      this.syncAutoplay();
    };
    this._onAutoVisibility = () => {
      this.autoHidden = document.hidden === true;
      this.syncAutoplay();
    };
    // Hover-pause only where hover exists: on touch devices a tap fires a
    // compat `mouseenter` with no `mouseleave`, which would pause forever.
    this._autoHoverCapable =
      this.o.pauseOnHover &&
      (typeof window.matchMedia !== "function" || window.matchMedia("(hover: hover)").matches);
    this._autoHoverEl = this.o.hoverEl || pauseEl;
    if (this._autoHoverCapable) {
      this._autoHoverEl.addEventListener("mouseenter", this._onAutoEnter);
      this._autoHoverEl.addEventListener("mouseleave", this._onAutoLeave);
    }
    pauseEl.addEventListener("focusin", this._onAutoFocusIn);
    pauseEl.addEventListener("focusout", this._onAutoFocusOut);
    document.addEventListener("visibilitychange", this._onAutoVisibility);

    if (typeof IntersectionObserver === "function") {
      this._autoIo = new IntersectionObserver(
        (entries) => {
          this.autoInView = entries.some((e) => e.isIntersecting);
          this.syncAutoplay();
        },
        { threshold: 0.1 }
      );
      this._autoIo.observe(this.msContainer);
    }

    this.autoplayEnabled = true;
    this.syncAutoplay();
  }

  autoplayShouldRun() {
    return (
      this.autoplayEnabled &&
      this.enabled &&
      !this.pointerActive &&
      !this.autoHover &&
      !this.autoFocus &&
      !this.autoHidden &&
      this.autoInView
    );
  }

  syncAutoplay() {
    if (this.autoplayShouldRun()) this.startAutoplayTimers();
    else this.stopAutoplayTimers();
  }

  // Stop + start so the next automatic step comes a full interval after the
  // user's last interaction instead of half a beat later.
  restartAutoplay() {
    if (!this.autoplayEnabled) return;
    this.stopAutoplayTimers();
    this.syncAutoplay();
  }

  startAutoplayTimers() {
    if (this.autoplayInterval && !this.autoplayTimer) {
      this.autoplayTimer = setInterval(() => {
        if (!this.animating && !this.pointerActive) this.next();
      }, this.autoplayInterval);
    }
    if (this.autoScrollSpeed && !this.autoScrollRaf) {
      this.autoScrollLast = null;
      const tick = (now) => {
        this.autoScrollRaf = requestAnimationFrame(tick);
        if (this.autoScrollLast !== null && !this.animating && !this.pointerActive) {
          // Cap dt so a throttled background tab doesn't jump on return.
          const dt = Math.min(now - this.autoScrollLast, 100);
          this.targetPosition -= (this.o.reverse ? -1 : 1) * (this.autoScrollSpeed * dt) / 1000;
          if (!this.o.loop) this.checkBounds(true);
          this.renderTarget();
        }
        this.autoScrollLast = now;
      };
      this.autoScrollRaf = requestAnimationFrame(tick);
    }
  }

  stopAutoplayTimers() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
    if (this.autoScrollRaf) {
      cancelAnimationFrame(this.autoScrollRaf);
      this.autoScrollRaf = null;
    }
  }

  destroyAutoplay() {
    this.stopAutoplayTimers();
    this.autoplayEnabled = false;
    if (this._autoHoverEl) {
      this._autoHoverEl.removeEventListener("mouseenter", this._onAutoEnter);
      this._autoHoverEl.removeEventListener("mouseleave", this._onAutoLeave);
      this._autoHoverEl = null;
    }
    if (this._autoPauseEl) {
      this._autoPauseEl.removeEventListener("focusin", this._onAutoFocusIn);
      this._autoPauseEl.removeEventListener("focusout", this._onAutoFocusOut);
      this._autoPauseEl = null;
    }
    if (this._onAutoVisibility) {
      document.removeEventListener("visibilitychange", this._onAutoVisibility);
    }
    if (this._autoIo) {
      this._autoIo.disconnect();
      this._autoIo = null;
    }
  }

  setStyleToNode(node, style, diff, lower) {
    if (!node || !style) return;
    for (const property in style) {
      if (property[0] === ".") {
        this.setStyleToNode(node.querySelector(property), style[property], diff, lower);
      } else if (property === "transform") {
        let value = "";
        const transforms = style[property];
        for (let i = 0; i < transforms.length; i++) {
          const transform = transforms[i];
          for (const fn in transform) {
            value += fn + "(" + getCurrentValue(transform[fn], diff, lower);
            if (fn === "rotate") value += "deg";
            else if (fn === "translateX" || fn === "translateY" || fn === "translateZ") value += "px";
            value += ") ";
          }
        }
        node.style[property] = value;
      } else {
        node.style[property] = getCurrentValue(style[property], diff, lower);
      }
    }
  }

  setStyle(index, diff, lower) {
    this.setStyleToNode(this.msSlides[index], this.o.style, diff, lower);
    if (isFn(this.o.customStyles)) this.o.customStyles(index, diff, lower);
  }

  renderTarget() {
    if (this.o.sync) {
      for (let i = this.o.sync.length - 1; i >= 0; i--) {
        const syncSlider = this.o.sync[i];
        syncSlider.targetPosition =
          (syncSlider.o.reverse ? -1 : 1) * (this.targetPosition / this.sliderWidth) * syncSlider.sliderWidth;
        syncSlider.renderTarget();
      }
    }

    const paddingLength = this.o.loop * this.step;
    const contentLength = this.sliderWidth - paddingLength * 2;
    if (this.o.loop && contentLength > 0) {
      // Wrap the travelled distance into the real-slide range. Sign-aware so
      // reversed sliders (positive positions) wrap too — the original assumed
      // a negative position and mis-wrapped `reverse` + `loop` sliders.
      const sign = this.o.reverse ? 1 : -1;
      let travelled = sign * this.targetPosition;
      while (travelled < paddingLength) travelled += contentLength;
      while (travelled >= paddingLength + contentLength) travelled -= contentLength;
      this.targetPosition = sign * travelled;
    }

    const actualIndex = ((this.o.reverse ? 1 : -1) * this.targetPosition) / this.step;
    this.onChangeCurrentIndex(Math.round(actualIndex));

    const lowerIndex = Math.floor(actualIndex);
    const higherIndex = Math.ceil(actualIndex);
    const lowerDiff = actualIndex - lowerIndex;
    const higherDiff = actualIndex - higherIndex;

    if (!isUnd(this.lowerIndex) && this.lowerIndex !== lowerIndex && this.lowerIndex !== higherIndex) {
      this.setStyle(this.lowerIndex, 1, true);
    }
    if (!isUnd(this.higherIndex) && this.higherIndex !== lowerIndex && this.higherIndex !== higherIndex) {
      this.setStyle(this.higherIndex, -1);
    }

    if (lowerIndex >= 0 && lowerIndex < this.sliderLength) {
      this.setStyle(lowerIndex, lowerDiff, true);
      this.lowerIndex = lowerIndex;
    }
    if (higherIndex >= 0 && higherIndex < this.sliderLength) {
      this.setStyle(higherIndex, higherDiff);
      this.higherIndex = higherIndex;
    }

    this.msTrack.style.transform =
      "translate" + (this.o.vertical ? "Y" : "X") + "(" + this.targetPosition + "px)";
  }

  onDown(ev) {
    // Primary button only: middle-click (Windows autoscroll) and right-click
    // (context menu) never deliver a matching mouseup to the document.
    if (ev.type === "mousedown" && ev.button !== 0) return;
    if (this.enabled && !this.pointerActive) {
      const event = normalizeEvent(ev);
      this.pointerActive = true;
      this.suppressClick = false;
      this.syncAutoplay(); // pause while the user holds the slider
      this.pointerId = event.id;

      this.pointerLastX = this.pointerCurrentX = event.x;
      this.pointerLastY = this.pointerCurrentY = event.y;
      this.trackingPoints = [];
      this.addTrackingPoint(this.pointerLastX, this.pointerLastY);

      if (this.animateInstance) this.animateInstance.stop();
    }
  }

  onMove(ev) {
    if (this.enabled && this.pointerActive) {
      const event = normalizeEvent(ev);

      if (event.id === this.pointerId) {
        this.pointerCurrentX = event.x;
        this.pointerCurrentY = event.y;

        let shouldMoveSlider = this.pointerMoved;
        if (!this.pointerMoved) {
          const movingVertically =
            Math.abs(Math.abs(this.pointerCurrentX) - Math.abs(this.pointerLastX)) <
            Math.abs(Math.abs(this.pointerCurrentY) - Math.abs(this.pointerLastY));
          if (
            (this.o.vertical && movingVertically) ||
            (!this.o.vertical && !movingVertically)
          ) {
            shouldMoveSlider = true;
          }
        }

        if (shouldMoveSlider) {
          ev.preventDefault();
          this.pointerMoved = true;
          this.addTrackingPoint(this.pointerLastX, this.pointerLastY);
          this.requestTick();
        } else {
          this.stopTracking(-1);
        }
      }
    }
  }

  onUp(ev) {
    if (this.enabled && this.pointerActive) {
      const event = normalizeEvent(ev);

      if (event.id === this.pointerId) {
        let slide = ev.target;
        if (this.msTrack.contains(slide)) {
          while (!slide.matches(".ms-slide, .ms-track")) {
            slide = slide.parentNode;
          }
        }
        const index = Array.prototype.indexOf.call(this.msSlides, slide);
        if (!this.pointerMoved) {
          if (index !== -1) {
            this.currentIndex = index;
            this.updateSlider();
          }
        } else {
          // The browser fires `click` right after this mouseup; swallow that
          // one only (cleared on the next tick so keyboard clicks still work).
          this.suppressClick = true;
          setTimeout(() => {
            this.suppressClick = false;
          }, 0);
        }
        this.stopTracking(index);
      }
    }
  }

  onResize() {
    this.refresh();
  }

  // Gesture aborted without a matching up event (touchcancel, window blur):
  // release the pointer and settle on the nearest slide.
  cancelPointer() {
    if (!this.pointerActive) return;
    this.stopTracking(-1);
  }

  stopTracking(index) {
    this.pointerActive = false;
    if (this.pointerMoved || index === -1) {
      this.pointerMoved = false;
      this.addTrackingPoint(this.pointerLastX, this.pointerLastY);
      this.startDecelAnim();
    }
    this.restartAutoplay();
  }

  addTrackingPoint(x, y) {
    const time = Date.now();
    while (this.trackingPoints.length > 0) {
      if (time - this.trackingPoints[0].time <= 100) break;
      this.trackingPoints.shift();
    }
    this.trackingPoints.push({ x: x, y: y, time: time });
  }

  updateAndRender() {
    const pointerChange = this.o.vertical
      ? this.pointerCurrentY - this.pointerLastY
      : this.pointerCurrentX - this.pointerLastX;
    this.targetPosition += pointerChange * this.o.multiplier;

    if (!this.o.loop) {
      if (this.o.bounceCoefficient) {
        const diff = this.checkBounds();
        if (diff !== 0) {
          this.targetPosition -= pointerChange * dragOutOfBoundsMultiplier(diff) * this.o.multiplier;
        }
      } else {
        this.checkBounds(true);
      }
    }

    this.renderTarget();

    this.pointerLastX = this.pointerCurrentX;
    this.pointerLastY = this.pointerCurrentY;
    this.ticking = false;
  }

  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(this.updateAndRender.bind(this));
    }
    this.ticking = true;
  }

  checkBounds(restrict) {
    let diff = 0;
    if (this.boundMin !== undefined && this.targetPosition < this.boundMin) {
      diff = this.boundMin - this.targetPosition;
    } else if (this.boundMax !== undefined && this.targetPosition > this.boundMax) {
      diff = this.boundMax - this.targetPosition;
    }
    if (restrict) {
      if (diff !== 0) {
        this.targetPosition = diff > 0 ? this.boundMin : this.boundMax;
      }
    }
    return diff;
  }

  startDecelAnim() {
    const firstPoint = this.trackingPoints[0];
    const lastPoint = this.trackingPoints[this.trackingPoints.length - 1];
    if (!firstPoint || !lastPoint) return;

    const positionOffset = this.o.vertical ? lastPoint.y - firstPoint.y : lastPoint.x - firstPoint.x;
    const timeOffset = lastPoint.time - firstPoint.time;
    const D = timeOffset / 15 / this.o.multiplier;
    this.decVel = positionOffset / D || 0;

    let newTargetPosition = this.targetPosition + this.decVel * 12;

    // Snap to nearest slide step
    const newTargetPositionOffset = newTargetPosition % this.step;
    newTargetPosition -= newTargetPositionOffset;
    if (Math.abs(newTargetPositionOffset) > this.step / 2) {
      newTargetPosition += (newTargetPositionOffset > 0 ? 1 : -1) * this.step;
    }

    // No wrapping here (matches the original): the throw may legitimately
    // land on a loop clone; renderTarget() wraps the position every frame and
    // fixCurrentIndex() maps the index back onto a real slide.
    this.updateSlider(newTargetPosition);
  }

  fixCurrentIndex() {
    if (this.o.loop) {
      // Map any (possibly multi-wrap) clone index back onto a real slide.
      const realLength = this.sliderLength - this.o.loop * 2;
      const real = this.currentIndex - this.o.loop;
      this.currentIndex = this.o.loop + (((real % realLength) + realLength) % realLength);
    }
  }

  updateSlider(newTargetPosition, initial) {
    if (isUnd(newTargetPosition)) {
      newTargetPosition = (this.o.reverse ? 1 : -1) * this.currentIndex * this.step;
    } else {
      this.currentIndex = ((this.o.reverse ? 1 : -1) * newTargetPosition) / this.step;
    }
    this.fixCurrentIndex();
    if (newTargetPosition !== this.targetPosition) {
      this.updateClassnames();
      this.animateTarget(newTargetPosition, initial);
    }
  }

  animateTarget(newTargetPosition, initial, back) {
    if (this.animateInstance) this.animateInstance.stop();
    const _ = this;
    const from = this.targetPosition;
    const to = newTargetPosition;
    this.animating = true; // autoplay drift/steps wait for the snap to settle

    let animateInstance = { stop() {} }; // default no-op, replaced below
    animateInstance = animate(
      function (progress) {
        _.targetPosition = from + (to - from) * progress;
        if (progress === 1) _.animating = false;
        const sliderMin = _.o.reverse ? 0 : -(_.sliderLength - 1) * _.step;
        const sliderMax = _.o.reverse ? (_.sliderLength - 1) * _.step : 0;

        if (
          !back &&
          !_.o.loop &&
          _.o.bounceCoefficient &&
          ((_.targetPosition > sliderMax &&
            _.targetPosition > sliderMax + Math.min((to - sliderMax) * _.o.bounceCoefficient, _.o.bounceMax)) ||
            (_.targetPosition < sliderMin &&
              _.targetPosition < sliderMin - Math.min(-(to - sliderMin) * _.o.bounceCoefficient, _.o.bounceMax)))
        ) {
          animateInstance.stop();
          _.animateTarget(_.targetPosition < sliderMin ? sliderMin : sliderMax, false, true);
          _.currentIndex = _.targetPosition < sliderMin ? 0 : _.sliderLength - 1;
        } else {
          _.renderTarget();
        }
      },
      initial ? 0 : _.o.animDuration,
      function (t) {
        return t * (2 - t);
      }
    );
    this.animateInstance = {
      stop() {
        animateInstance.stop();
        _.animating = false;
      },
    };
  }

  onChangeCurrentIndex(index) {
    let currentIndex = this.o.loop ? index - this.o.loop : index;
    if (this.o.loop) {
      // Index may point at a leading/trailing clone — map onto the real slide.
      const realLength = this.sliderLength - this.o.loop * 2;
      currentIndex = ((currentIndex % realLength) + realLength) % realLength;
    } else {
      // Rubber-band overscroll can round past either edge; clamp so we never
      // announce an out-of-range slide when not looping.
      if (currentIndex < 0) currentIndex = 0;
      else if (currentIndex > this.sliderLength - 1) currentIndex = this.sliderLength - 1;
    }
    if (isFn(this.o.change) && currentIndex !== this.lastCurrentIndex) {
      this.o.change(currentIndex, this.lastCurrentIndex);
      this.lastCurrentIndex = currentIndex;
    }
  }

  getCurrentIndex() {
    return this.o.loop ? this.currentIndex - this.o.loop : this.currentIndex;
  }

  // Re-measure responsive slide sizes and re-render at the current slide.
  refresh() {
    if (!this.msSlides || !this.msSlides.length) return;

    this.step = this.o.vertical ? this.msSlides[0].scrollHeight : this.msSlides[0].scrollWidth;
    this.sliderWidth = this.sliderLength * this.step;
    this.msTrack.style[this.o.vertical ? "height" : "width"] = this.sliderWidth + "px";
    this.boundMin = this.o.reverse ? 0 : -this.step * (this.sliderLength - 1);
    this.boundMax = this.o.reverse ? this.step * (this.sliderLength - 1) : 0;

    if (this.o.sync) {
      for (let i = this.o.sync.length - 1; i >= 0; i--) {
        const s = this.o.sync[i];
        if (!s.msSlides || !s.msSlides.length) continue;
        s.step = s.o.vertical ? s.msSlides[0].scrollHeight : s.msSlides[0].scrollWidth;
        s.sliderWidth = s.sliderLength * s.step;
        s.msTrack.style[s.o.vertical ? "height" : "width"] = s.sliderWidth + "px";
        s.boundMin = s.o.reverse ? 0 : -s.step * (s.sliderLength - 1);
        s.boundMax = s.o.reverse ? s.step * (s.sliderLength - 1) : 0;
      }
    }

    const snapped =
      Math.round(((this.o.reverse ? 1 : -1) * this.targetPosition) / this.step) * this.step;
    this.targetPosition = (this.o.reverse ? 1 : -1) * snapped;
    this.checkBounds(true);

    this.lowerIndex = undefined;
    this.higherIndex = undefined;
    const actualIndex = ((this.o.reverse ? 1 : -1) * this.targetPosition) / this.step;
    for (let index = this.sliderLength - 1; index >= 0; index--) {
      let diff = actualIndex - index;
      if (diff > 1) diff = 1;
      else if (diff < -1) diff = -1;
      this.setStyle(index, diff, diff > 0);
    }

    this.renderTarget();
  }

  destroy() {
    if (this.animateInstance) this.animateInstance.stop();
    this.enabled = false;
    this.pointerActive = false;
    this.destroyAutoplay();

    // Leave the DOM as we found it so a fresh instance (StrictMode remount,
    // hot reload) measures the real slides, not stale clones.
    this.removeClones();
    this.msTrack.style.transform = "";
    this.msTrack.style[this.o.vertical ? "height" : "width"] = "";

    if (this._onDown) {
      this.msContainer.removeEventListener("touchstart", this._onDown);
      this.msContainer.removeEventListener("mousedown", this._onDown);
    }
    if (this._onDragStart) {
      this.msContainer.removeEventListener("dragstart", this._onDragStart);
    }
    if (this._onClick) {
      this.msContainer.removeEventListener("click", this._onClick, true);
    }
    if (this._onCancel) {
      window.removeEventListener("blur", this._onCancel);
    }
    if (this._onMove) {
      document.removeEventListener("touchmove", this._onMove);
      document.removeEventListener("mousemove", this._onMove);
    }
    if (this._onUp) {
      document.removeEventListener("touchend", this._onUp);
      document.removeEventListener("mouseup", this._onUp);
    }
    if (this._onCancel) {
      document.removeEventListener("touchcancel", this._onCancel);
    }
    if (this._onResize) {
      window.removeEventListener("resize", this._onResize);
    }
    if (this._prevEl && this._prevHandler) {
      this._prevEl.removeEventListener("click", this._prevHandler);
    }
    if (this._nextEl && this._nextHandler) {
      this._nextEl.removeEventListener("click", this._nextHandler);
    }
  }

  enable() {
    this.enabled = true;
    this.syncAutoplay();
  }

  disable() {
    this.enabled = false;
    this.syncAutoplay();
  }
}

export default MomentumSlider;
