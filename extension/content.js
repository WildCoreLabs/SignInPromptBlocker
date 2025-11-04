(async function () {
  // Allowlist check
  try {
    const { allowlist = [] } = await chrome.storage.local.get({ allowlist: [] });
    const host = location.hostname.replace(/^www\./, "");
    if (allowlist.some(domain => host === domain || host.endsWith("." + domain))) {
      return; // Allowlisted: do nothing on this site
    }
  } catch (e) {
    // proceed anyway
  }

  const killSelectors = [
    "iframe[src*='accounts.google.com/gsi']",
    "#credential_picker_container",
    "[data-google-container-id]"
  ];

  function nuke() {
    killSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(n => n.remove());
    });
  }

  // Quick first pass before paint
  nuke();

  const mo = new MutationObserver((muts) => {
    let changed = false;
    for (const m of muts) {
      m.addedNodes && m.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.tagName === "IFRAME" && /accounts\.google\.com\/gsi/.test(node.src)) {
          node.remove();
          changed = true;
          return;
        }
        if (node.matches?.("#credential_picker_container, [data-google-container-id]")) {
          node.remove();
          changed = true;
          return;
        }
        node.querySelectorAll?.(killSelectors.join(",")).forEach(n => {
          n.remove();
          changed = true;
        });
      });
    }
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("load", nuke, { once: true });

  // ---- Smart Redirects: Google Maps -> Apple Maps (toggleable) ----
  let smartRedirects = false;
  try {
    const st = await chrome.storage.local.get({ smartRedirects: false });
    smartRedirects = !!st.smartRedirects;
  } catch (e) { smartRedirects = false; }

  function toAppleMapsFromGoogle(url) {
    try {
      const u = new URL(url);
      if (!/google\.com$/.test(u.hostname) && !/\.google\.com$/.test(u.hostname)) return null;
      if (!u.pathname.startsWith("/maps")) return null;

      // 1) q= query param (coords or place name)
      if (u.searchParams.has("q")) {
        const q = u.searchParams.get("q");
        return `http://maps.apple.com/?q=${encodeURIComponent(q)}`;
      }

      // 2) /@lat,lng pattern
      const at = u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (at) {
        return `http://maps.apple.com/?ll=${at[1]},${at[2]}`;
      }

      // 3) /maps/place/<query>
      const place = u.pathname.match(/\/maps\/place\/([^\/]+)/);
      if (place) {
        const query = decodeURIComponent(place[1].replace(/\+/g, ' '));
        return `http://maps.apple.com/?q=${encodeURIComponent(query)}`;
      }

      // 4) directions-like
      if (u.searchParams.has("destination")) {
        const d = u.searchParams.get("destination");
        return `http://maps.apple.com/?daddr=${encodeURIComponent(d)}`;
      }

      return null;
    } catch (e) { return null; }
  }

  if (smartRedirects) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href*="google.com/maps"]');
      if (!a) return;
      const apple = toAppleMapsFromGoogle(a.href);
      if (apple) {
        e.preventDefault();
        window.location.href = apple;
      }
    }, true);
  }
  // ---- End Smart Redirects ----
})();