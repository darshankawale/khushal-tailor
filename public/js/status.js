function updateStatus(status, settings) {
  const badge = document.getElementById('status-badge');
  const banner = document.getElementById('holiday-banner');
  if (!badge) return;

  if (settings && settings.showStatus === false) {
    badge.style.display = 'none';
    if (banner) banner.classList.add('hidden');
    return;
  }

  badge.style.display = 'inline-flex';
  badge.className = 'status-badge';

  if (status.status === 'open') {
    badge.classList.add('open');
    badge.textContent = '🟢 ' + (window.i18n ? window.i18n.t('status.open') : 'Open Now');
    if (banner) banner.classList.add('hidden');
  } else if (status.status === 'holiday') {
    badge.classList.add('holiday');
    badge.textContent = '🔴 ' + (window.i18n ? window.i18n.t('status.holiday') : 'Temporarily Closed');
    if (banner) {
      banner.classList.remove('hidden');
      let msg = status.message || 'Temporarily closed';
      if (status.reopenAt) msg += ' · Reopens: ' + status.reopenAt;
      banner.textContent = msg;
    }
  } else {
    badge.classList.add('closed');
    badge.textContent = '🔴 ' + (window.i18n ? window.i18n.t('status.closed') : 'Closed Now');
    if (banner) banner.classList.add('hidden');
  }
}

window.updateStatus = updateStatus;
