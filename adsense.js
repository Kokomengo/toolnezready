/* Advertising is off during review. Keep Auto ads disabled in the dashboard.
   After approval, configure one manual slot and the required CMP. See ADSENSE.md. */
window.ADSENSE = {
  client: 'ca-pub-2170099684772121',
  enabled: false,
  autoAds: false,
  guideSlot: ''
};
window.ToolNezAds = (() => {
  let consent = false, loading = false, loaded = false;
  const eligible = () => {
    const cfg = window.ADSENSE;
    const article = document.querySelector('[data-editorial-guide]');
    return cfg.enabled === true && cfg.autoAds === false && consent &&
      /^ca-pub-\d{16}$/.test(cfg.client) && /^\d+$/.test(cfg.guideSlot) &&
      article && location.pathname === '/guides/' + article.dataset.editorialGuide &&
      document.querySelector('#guide-ad');
  };
  function fill() {
    if (!eligible() || !loaded) return;
    const root = document.querySelector('#guide-ad');
    if (root.querySelector('ins')) return;
    const label = document.createElement('span');
    label.className = 'tiny dim'; label.textContent = 'Advertisement';
    const unit = document.createElement('ins');
    unit.className = 'adsbygoogle'; unit.style.display = 'block';
    unit.dataset.adClient = window.ADSENSE.client;
    unit.dataset.adSlot = window.ADSENSE.guideSlot;
    unit.dataset.adFormat = 'auto'; unit.dataset.fullWidthResponsive = 'true';
    root.append(label, unit);
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
  function render() {
    if (!eligible()) return;
    if (loaded) { fill(); return; }
    if (loading) return;
    loading = true;
    const script = document.createElement('script');
    script.id = 'toolnez-ad-script'; script.async = true; script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + window.ADSENSE.client;
    script.onload = () => { loaded = true; fill(); };
    script.onerror = () => { loading = false; script.remove(); };
    document.head.appendChild(script);
  }
  return {
    render,
    // Call only after the CMP establishes that advertising code may run.
    allowAfterConsent() { consent = true; render(); },
    revokeConsent() { consent = false; document.querySelector('#guide-ad')?.replaceChildren(); }
  };
})();

