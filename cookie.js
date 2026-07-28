(function () {
  var COOKIE_KEY = 'fu_cookie_consent';

  // Private-mode Safari throws on localStorage; the banner must not take
  // the rest of the page down with it.
  var store = {
    get: function () { try { return localStorage.getItem(COOKIE_KEY); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(COOKIE_KEY, v); } catch (e) {} }
  };

  if (store.get()) return;

  // The legal section lives on the home page, so link there from every page
  // rather than to a bare "#legal" that only resolves on the home page.
  var onHome = /(^\/$|\/index\.html$)/.test(location.pathname);
  var legalHref = onHome ? '#legal' : '/index.html#legal';

  // ── Inject styles ──
  var style = document.createElement('style');
  style.textContent = `
    .fu-cookie {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(120%);
      /* Below the nav (600) and drawer (590) so the fullscreen mobile menu
         covers the banner instead of the banner floating on top of it. */
      z-index: 500;
      width: min(680px, calc(100vw - 2rem));
      background: #0e0e0e;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 3px;
      padding: 1.6rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
      transition: transform .6s cubic-bezier(.16,1,.3,1), opacity .6s;
      opacity: 0;
      box-shadow: 0 24px 80px rgba(0,0,0,.8);
    }
    .fu-cookie.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .fu-cookie-text {
      display: flex;
      flex-direction: column;
      gap: .35rem;
      flex: 1;
      min-width: 200px;
    }
    .fu-cookie-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 600;
      font-size: .72rem;
      letter-spacing: .22em;
      text-transform: uppercase;
      color: #f0ede8;
    }
    .fu-cookie-desc {
      font-family: 'Barlow', sans-serif;
      font-weight: 300;
      font-size: .78rem;
      color: #8a8a8a;
      line-height: 1.6;
    }
    .fu-cookie-desc a {
      color: #888;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color .2s;
    }
    .fu-cookie-desc a:hover { color: #f0ede8; }
    .fu-cookie-actions {
      display: flex;
      gap: .7rem;
      flex-shrink: 0;
    }
    .fu-cookie-btn {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 600;
      font-size: .68rem;
      letter-spacing: .2em;
      text-transform: uppercase;
      border: none;
      border-radius: 2px;
      padding: .65rem 1.4rem;
      cursor: pointer;
      transition: background .2s, transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s;
    }
    .fu-cookie-accept {
      background: #f0ede8;
      color: #060606;
    }
    .fu-cookie-accept:hover {
      background: #fff;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255,255,255,.1);
    }
    .fu-cookie-decline {
      background: transparent;
      color: #8a8a8a;
      border: 1px solid rgba(255,255,255,0.07);
    }
    .fu-cookie-decline:hover {
      color: #f0ede8;
      border-color: rgba(255,255,255,.2);
    }
    @media (max-width: 480px) {
      .fu-cookie { padding: 1.4rem; gap: 1.2rem; bottom: 1rem; }
      .fu-cookie-actions { width: 100%; }
      .fu-cookie-btn { flex: 1; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ──
  var banner = document.createElement('div');
  banner.className = 'fu-cookie';
  banner.id = 'fuCookie';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="fu-cookie-text">
      <span class="fu-cookie-title">Funk Universe — Cookies</span>
      <span class="fu-cookie-desc">
        We use cookies to ensure basic functionality and improve your experience.
        By continuing, you agree to our use of cookies.
        <a href="${legalHref}">Learn more</a>
      </span>
    </div>
    <div class="fu-cookie-actions">
      <button class="fu-cookie-btn fu-cookie-decline" id="fuCookieDecline">Decline</button>
      <button class="fu-cookie-btn fu-cookie-accept" id="fuCookieAccept">Accept</button>
    </div>
  `;
  document.body.appendChild(banner);

  // ── Show after delay ──
  setTimeout(function () {
    banner.classList.add('show');
  }, 1200);

  // ── Auto-hide after 15 seconds if no action ──
  setTimeout(function () {
    if (!store.get()) hideBanner();
  }, 15000);

  // Escape dismisses the banner without recording a choice.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && banner.parentNode) hideBanner();
  });

  // ── Hide banner ──
  function hideBanner() {
    banner.style.transform = 'translateX(-50%) translateY(120%)';
    banner.style.opacity = '0';
    setTimeout(function () {
      if (banner.parentNode) banner.remove();
    }, 600);
  }

  // ── Accept ──
  document.getElementById('fuCookieAccept').addEventListener('click', function () {
    store.set('accepted');
    hideBanner();
  });

  // ── Decline ──
  document.getElementById('fuCookieDecline').addEventListener('click', function () {
    store.set('declined');
    hideBanner();
  });

})();
