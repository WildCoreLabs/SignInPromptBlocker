(async function () {
  try {
    const { allowlist = [] } = await chrome.storage.local.get({ allowlist: [] });
    const host = location.hostname.replace(/^www\./, "");
    if (allowlist.some(domain => host === domain || host.endsWith("." + domain))) {
      return; // Allowlisted: do nothing on this site
    }
  } catch (e) {
    // If storage fails, continue with blocking anyway
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
    if (changed) {
      // Optionally could log to console for debugging
    }
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("load", nuke, { once: true });
})();