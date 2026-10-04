async function loadShop() {
  try {
    const res = await fetch('/api/shop?t=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      console.error('API /api/shop failed', res.status);
      return;
    }
    const data = await res.json();
    const shop = data.shop || {};
    const settings = data.settings || {};
    const timings = data.timings || {};
    const services = data.services || [];
    const gallery = data.gallery || [];
    const status = data.status || {};

    console.log('Shop data loaded:', shop.shopName, shop.heroSubtitle && shop.heroSubtitle.slice(0, 40));

    // --- Apply content FIRST (before theme/lang so nothing overwrites) ---
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el && value != null) el.textContent = value;
    };

    setText('shop-name', shop.shopName || 'Shop');
    document.title = shop.shopName || 'Tailor Shop';

    setText('hero-heading', shop.heroHeading || '');
    setText('hero-subtitle', shop.heroSubtitle || '');

    const hero = document.getElementById('home');
    if (hero && shop.heroImage) {
      hero.style.backgroundImage = 'url("' + shop.heroImage + '")';
      hero.classList.add('has-image');
    }

    setText('about-title', shop.aboutTitle || 'About Our Shop');
    // Remove i18n attr so language switch does not wipe owner text
    const aboutTitleEl = document.getElementById('about-title');
    if (aboutTitleEl) aboutTitleEl.removeAttribute('data-i18n');

    setText('about-text', shop.aboutText || '');
    setText('experience', shop.experience || '');
    setText('speciality', shop.speciality || '');

    const logo = document.getElementById('logo');
    if (logo) {
      if (shop.logo && typeof safeImg === 'function') safeImg(logo, shop.logo, 'logo');
      else if (shop.logo) { logo.src = shop.logo; logo.style.display = 'block'; }
      else logo.style.display = 'none';
    }

    const aboutImg = document.getElementById('about-image');
    const ownerImg = document.getElementById('owner-photo');
    if (shop.aboutImage) {
      if (typeof safeImg === 'function') safeImg(aboutImg, shop.aboutImage, 'about');
      else if (aboutImg) { aboutImg.src = shop.aboutImage; aboutImg.style.display = 'block'; }
      if (ownerImg) ownerImg.style.display = 'none';
    } else if (shop.ownerPhoto) {
      if (typeof safeImg === 'function') safeImg(ownerImg, shop.ownerPhoto, 'owner');
      else if (ownerImg) { ownerImg.src = shop.ownerPhoto; ownerImg.style.display = 'block'; }
      if (aboutImg) aboutImg.style.display = 'none';
    } else if (aboutImg && typeof safeImg === 'function') {
      safeImg(aboutImg, null, 'about');
      if (ownerImg) ownerImg.style.display = 'none';
    }

    // Buttons
    const wa = String(shop.whatsapp || '').replace(/\D/g, '');
    const phone = String(shop.phone || '').replace(/\s/g, '');
    const btnWa = document.getElementById('btn-whatsapp');
    const btnCall = document.getElementById('btn-call');
    if (btnWa && wa) btnWa.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hello, I would like to enquire about your services.');
    if (btnCall && phone) btnCall.href = 'tel:' + phone;

    // Services
    const sg = document.getElementById('services-grid');
    if (sg) {
      const list = (services || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      sg.innerHTML = list.map(s =>
        '<div class="service-card">' +
        (s.image
          ? '<img src="' + s.image + '" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:8px;margin-bottom:12px" onerror="this.style.display=\'none\'">'
          : '<div class="service-icon">' + (s.icon || '✂️') + '</div>') +
        '<h3>' + (s.name || '') + '</h3>' +
        '<p>' + (s.description || '') + '</p>' +
        '<div class="service-price">' + (s.price || '') + '</div></div>'
      ).join('') || '<p style="text-align:center;color:var(--text-muted)">No services yet</p>';
    }

    const sel = document.getElementById('enquiry-service');
    if (sel) {
      sel.innerHTML = '<option value="">Select service</option>';
      (services || []).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        sel.appendChild(opt);
      });
    }

    const wg = document.getElementById('why-grid');
    if (wg) {
      wg.innerHTML = (shop.whyChooseUs || []).map(w => '<div class="why-item">' + w + '</div>').join('');
    }

    // Gallery
    let galleryItems = gallery || [];
    if (!galleryItems.length && window.PLACEHOLDERS) {
      galleryItems = [
        { id: 'demo1', url: PLACEHOLDERS.gallery, category: 'Shop', caption: 'Sample' },
        { id: 'demo2', url: PLACEHOLDERS.gallery, category: "Men's", caption: 'Sample' },
        { id: 'demo3', url: PLACEHOLDERS.gallery, category: "Women's", caption: 'Sample' },
        { id: 'demo4', url: PLACEHOLDERS.gallery, category: 'Wedding', caption: 'Sample' }
      ];
    }
    if (typeof renderGallery === 'function') renderGallery(galleryItems);

    // YouTube
    function extractYoutubeId(url) {
      if (!url) return null;
      const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
      return m ? m[1] : null;
    }
    const ytId = extractYoutubeId(shop.youtubeVideoUrl);
    const videoSection = document.getElementById('video');
    const videoWrap = document.getElementById('video-wrap');
    if (ytId && videoSection && videoWrap) {
      videoSection.style.display = 'block';
      videoWrap.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytId + '" title="YouTube" allowfullscreen loading="lazy"></iframe>';
    } else if (videoSection) {
      videoSection.style.display = 'none';
    }

    // Reviews
    const reviewUrl = shop.googleReviewUrl ||
      (shop.shopName ? 'https://www.google.com/search?q=' + encodeURIComponent(shop.shopName + ' ' + (shop.address || '') + ' reviews') : '#');
    const btnGr = document.getElementById('btn-google-reviews');
    const btnWr = document.getElementById('btn-write-review');
    if (btnGr) btnGr.href = reviewUrl;
    if (btnWr) btnWr.href = shop.googleReviewUrl || reviewUrl;

    // Contact
    setText('contact-name', shop.shopName || '');
    setText('contact-address', [shop.address, shop.pincode].filter(Boolean).join(', '));
    const contactPhone = document.getElementById('contact-phone');
    if (contactPhone) {
      contactPhone.innerHTML = phone ? '<a href="tel:' + phone + '">' + (shop.phone || phone) + '</a>' : '';
    }
    const contactWa = document.getElementById('contact-whatsapp');
    if (contactWa && wa) contactWa.href = 'https://wa.me/' + wa;

    if (timings) {
      const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
      const labels = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };
      const lines = days.map(d => {
        const t = timings[d];
        if (!t || t.closed) return labels[d] + ': Closed';
        return labels[d] + ': ' + t.open + ' – ' + t.close;
      });
      setText('contact-hours', '');
      const hoursEl = document.getElementById('contact-hours');
      if (hoursEl) hoursEl.innerHTML = lines.join('<br>');
    }

    // Map
    const mapDiv = document.getElementById('map-embed');
    if (mapDiv) {
      const q = encodeURIComponent([shop.shopName, shop.address, shop.pincode].filter(Boolean).join(' ') || 'Pune');
      mapDiv.innerHTML = '<iframe src="https://maps.google.com/maps?q=' + q + '&output=embed" allowfullscreen loading="lazy"></iframe>';
    }
    const dirUrl = shop.googleMapsUrl ||
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([shop.shopName, shop.address].filter(Boolean).join(' '));
    const btnDir = document.getElementById('btn-directions');
    const contactDir = document.getElementById('contact-directions');
    if (btnDir) btnDir.href = dirUrl;
    if (contactDir) contactDir.href = dirUrl;

    // Footer
    setText('footer-name', shop.shopName || '');
    setText('footer-copy', shop.shopName || '');
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const social = document.getElementById('social-links');
    if (social) {
      const links = [];
      if (shop.instagram) links.push('<a href="' + shop.instagram + '" target="_blank" rel="noopener">Instagram</a>');
      if (shop.facebook) links.push('<a href="' + shop.facebook + '" target="_blank" rel="noopener">Facebook</a>');
      if (shop.youtube) links.push('<a href="' + shop.youtube + '" target="_blank" rel="noopener">YouTube</a>');
      social.innerHTML = links.join('');
    }

    // Theme & language (after content)
    try {
      if (typeof applyTheme === 'function') applyTheme(settings);
    } catch (e) { console.warn('theme error', e); }
    try {
      if (typeof initLanguage === 'function') {
        initLanguage(settings.languages || ['en', 'mr', 'hi'], settings.defaultLanguage || 'en');
      }
    } catch (e) { console.warn('language error', e); }
    try {
      if (typeof updateStatus === 'function') updateStatus(status, settings);
    } catch (e) { console.warn('status error', e); }

  } catch (err) {
    console.error('Failed to load shop data', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
  loadShop();
});
