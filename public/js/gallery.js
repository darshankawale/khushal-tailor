function renderGallery(items) {
  const grid = document.getElementById('gallery-grid');
  const filters = document.getElementById('gallery-filters');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1">No photos yet</p>';
    return;
  }

  const categories = ['All', ...new Set(items.map(i => i.category || 'Shop'))];
  filters.innerHTML = categories.map((c, i) =>
    `<button class="${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  function show(cat) {
    const list = cat === 'All' ? items : items.filter(i => (i.category || 'Shop') === cat);
    grid.innerHTML = list.map(item =>
      `<div class="gallery-item" data-url="${item.url}">
        <img src="${item.url}" alt="${item.caption || ''}" loading="lazy" onerror="this.onerror=null;this.src=(window.PLACEHOLDERS&&PLACEHOLDERS.gallery)||''">
      </div>`
    ).join('');

    grid.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.dataset.url));
    });
  }

  filters.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      show(btn.dataset.cat);
    });
  });

  show('All');
}

function openLightbox(url) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lb && img) {
    img.src = url;
    lb.classList.add('open');
  }
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const close = document.getElementById('lightbox-close');
  const lb = document.getElementById('lightbox');
  if (close) close.addEventListener('click', closeLightbox);
  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
});

window.renderGallery = renderGallery;
