document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('enquiry-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const fd = new FormData(form);
    try {
      const res = await fetch('/api/enquiry', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        form.style.display = 'none';
        if (success) success.classList.add('show');
      } else {
        alert(data.error || 'Failed to send enquiry');
        btn.disabled = false;
        btn.textContent = window.i18n ? window.i18n.t('enquiry.send') : 'Send Enquiry';
      }
    } catch (err) {
      alert('Network error. Please try again.');
      btn.disabled = false;
      btn.textContent = window.i18n ? window.i18n.t('enquiry.send') : 'Send Enquiry';
    }
  });
});
