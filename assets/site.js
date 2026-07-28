/* ==========================================================================
   FUNK UNIVERSE — shared behaviour
   Loaded with `defer` on every page. Each initialiser is a no-op when the
   markup it targets is absent, so the same file is safe everywhere.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Custom cursor ─────────────────────────────────────────────────────
     Desktop pointers only, and never when the visitor asked for less
     motion — the ring trails behind the pointer, which is precisely the
     effect that setting disables. */
  function initCursor() {
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var dot  = document.getElementById('cursor');
    var ring = document.getElementById('cring');
    if (!finePointer || reduceMotion || !dot || !ring) return;

    document.body.classList.add('custom-cursor');
    dot.style.display = 'block';
    ring.style.display = 'block';

    var mx = 0, my = 0, rx = 0, ry = 0, raf = null;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    function loop() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      // Idle out once the ring has caught up, rather than spinning forever.
      if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
  }

  /* ── Mobile drawer ──────────────────────────────────────────────────── */
  function initDrawer() {
    var drawer  = document.getElementById('drawer');
    var toggle  = document.getElementById('navToggle');
    if (!drawer || !toggle) return;

    var lastFocused = null;

    function lockScroll(on) {
      if (on) {
        // Compensate for the vanishing scrollbar so the page doesn't jump.
        var gap = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = gap > 0 ? gap + 'px' : '';
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    }

    function open() {
      lastFocused = document.activeElement;
      drawer.classList.add('open');
      drawer.removeAttribute('aria-hidden');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      lockScroll(true);
      var first = drawer.querySelector('a');
      if (first) first.focus();
    }

    function close() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      lockScroll(false);
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    }

    function isOpen() { return drawer.classList.contains('open'); }

    toggle.addEventListener('click', function () { isOpen() ? close() : open(); });

    // Every drawer link closes it — including same-page anchors, which
    // previously left the overlay covering the section they jumped to.
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;

      if (e.key === 'Escape') { close(); return; }

      // Keep Tab inside the drawer while it covers the page.
      if (e.key !== 'Tab') return;
      var items = Array.prototype.slice.call(drawer.querySelectorAll('a'));
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    // A resize up to desktop leaves the drawer stranded over the page.
    window.addEventListener('resize', function () {
      if (isOpen() && window.innerWidth > 1024) close();
    });

    close();
  }

  /* ── Scroll reveal ──────────────────────────────────────────────────── */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { io.observe(el); });

    // Safety net: nothing stays invisible if the observer never fires.
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
        el.classList.add('in');
      });
    }, 2500);
  }

  /* ── Mark the current page in the nav ───────────────────────────────── */
  function initCurrentPage() {
    var here = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '/index.html');
    document.querySelectorAll('nav a, .drawer a').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^https?:/i.test(href)) return;
      var path = href.split('#')[0];
      if (!path) return;
      var resolved = new URL(path, location.href).pathname
        .replace(/\/index\.html$/, '/').replace(/\/$/, '/index.html');
      if (resolved === here && href.indexOf('#') === -1) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ── Form helpers, shared by the three forms on the site ────────────── */

  // Flags a field and shows its inline message. Returns false for chaining.
  function markInvalid(el, message) {
    var field = el.closest('.field') || el.parentElement;
    if (!field) return false;
    field.classList.add('invalid');
    el.setAttribute('aria-invalid', 'true');
    var note = field.querySelector('.field-error');
    if (note && message) note.textContent = message;
    return false;
  }

  function clearInvalid(el) {
    var field = el.closest('.field') || el.parentElement;
    if (!field) return;
    field.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
  }

  // Clears the error state as soon as the visitor starts fixing the field.
  function watchFields(form) {
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      var evt = (el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT')
        ? 'change' : 'input';
      el.addEventListener(evt, function () { clearInvalid(el); });
    });
  }

  function setStatus(node, type, message) {
    if (!node) return;
    node.className = 'form-status show ' + type;
    node.textContent = message;
  }

  function clearStatus(node) {
    if (!node) return;
    node.className = 'form-status';
    node.textContent = '';
  }

  // Moves focus to the first field that failed, so the error is unmissable.
  function focusFirstInvalid(form) {
    var bad = form.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea, .invalid input');
    if (bad) {
      bad.focus();
      bad.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  window.FU = {
    markInvalid: markInvalid,
    clearInvalid: clearInvalid,
    watchFields: watchFields,
    setStatus: setStatus,
    clearStatus: clearStatus,
    focusFirstInvalid: focusFirstInvalid,
    isEmail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    isUrl: function (v) { return /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(v); },
    reduceMotion: reduceMotion
  };

  initCursor();
  initDrawer();
  initReveal();
  initCurrentPage();
})();
