const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.gallery': 'Gallery',
    'nav.reviews': 'Reviews',
    'nav.contact': 'Contact',
    'hero.directions': 'Get Directions',
    'about.title': 'About Our Shop',
    'about.experience': 'Experience',
    'about.speciality': 'Speciality',
    'services.title': 'Our Services',
    'services.sub': 'Quality craftsmanship for every garment',
    'why.title': 'Why Choose Us',
    'gallery.title': 'Our Work',
    'video.title': 'Watch Our Work',
    'reviews.title': 'Customer Reviews',
    'reviews.based': 'Based on Google Reviews',
    'reviews.view': 'View on Google',
    'reviews.write': 'Write a Review',
    'enquiry.title': 'Send Enquiry',
    'enquiry.sub': "We'll get back to you shortly",
    'enquiry.name': 'Name *',
    'enquiry.mobile': 'Mobile *',
    'enquiry.service': 'Service',
    'enquiry.date': 'Preferred Date',
    'enquiry.message': 'Message',
    'enquiry.image': 'Reference Image (optional)',
    'enquiry.send': 'Send Enquiry',
    'enquiry.success': 'The shop will contact you shortly.',
    'contact.title': 'Contact Us',
    'status.open': 'Open Now',
    'status.closed': 'Closed Now',
    'status.holiday': 'Temporarily Closed'
  },
  mr: {
    'nav.home': 'मुख्य',
    'nav.about': 'आमच्याबद्दल',
    'nav.services': 'सेवा',
    'nav.gallery': 'गॅलरी',
    'nav.reviews': 'पुनरावलोकने',
    'nav.contact': 'संपर्क',
    'hero.directions': 'दिशा मिळवा',
    'about.title': 'आमच्या दुकानाबद्दल',
    'about.experience': 'अनुभव',
    'about.speciality': 'विशेषता',
    'services.title': 'आमच्या सेवा',
    'services.sub': 'प्रत्येक कपड्यासाठी दर्जेदार कारागिरी',
    'why.title': 'आम्हाला का निवडावे',
    'gallery.title': 'आमचे काम',
    'video.title': 'आमचे काम पहा',
    'reviews.title': 'ग्राहक पुनरावलोकने',
    'reviews.based': 'Google पुनरावलोकनांवर आधारित',
    'reviews.view': 'Google वर पहा',
    'reviews.write': 'पुनरावलोकन लिहा',
    'enquiry.title': 'चौकशी पाठवा',
    'enquiry.sub': 'आम्ही लवकरच संपर्क करू',
    'enquiry.name': 'नाव *',
    'enquiry.mobile': 'मोबाइल *',
    'enquiry.service': 'सेवा',
    'enquiry.date': 'पसंतीची तारीख',
    'enquiry.message': 'संदेश',
    'enquiry.image': 'संदर्भ प्रतिमा (पर्यायी)',
    'enquiry.send': 'चौकशी पाठवा',
    'enquiry.success': 'दुकान लवकरच संपर्क करेल.',
    'contact.title': 'आमच्याशी संपर्क साधा',
    'status.open': 'आत्ता उघडे',
    'status.closed': 'आत्ता बंद',
    'status.holiday': 'तात्पुरते बंद'
  },
  hi: {
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.services': 'सेवाएँ',
    'nav.gallery': 'गैलरी',
    'nav.reviews': 'समीक्षाएँ',
    'nav.contact': 'संपर्क',
    'hero.directions': 'दिशा निर्देश',
    'about.title': 'हमारी दुकान के बारे में',
    'about.experience': 'अनुभव',
    'about.speciality': 'विशेषता',
    'services.title': 'हमारी सेवाएँ',
    'services.sub': 'हर परिधान के लिए गुणवत्तापूर्ण कारीगरी',
    'why.title': 'हमें क्यों चुनें',
    'gallery.title': 'हमारा काम',
    'video.title': 'हमारा काम देखें',
    'reviews.title': 'ग्राहक समीक्षाएँ',
    'reviews.based': 'Google समीक्षाओं पर आधारित',
    'reviews.view': 'Google पर देखें',
    'reviews.write': 'समीक्षा लिखें',
    'enquiry.title': 'पूछताछ भेजें',
    'enquiry.sub': 'हम जल्द संपर्क करेंगे',
    'enquiry.name': 'नाम *',
    'enquiry.mobile': 'मोबाइल *',
    'enquiry.service': 'सेवा',
    'enquiry.date': 'पसंदीदा तारीख',
    'enquiry.message': 'संदेश',
    'enquiry.image': 'संदर्भ छवि (वैकल्पिक)',
    'enquiry.send': 'पूछताछ भेजें',
    'enquiry.success': 'दुकान जल्द संपर्क करेगी।',
    'contact.title': 'संपर्क करें',
    'status.open': 'अभी खुला',
    'status.closed': 'अभी बंद',
    'status.holiday': 'अस्थायी रूप से बंद'
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  if (!translations[lang]) lang = 'en';
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) el.textContent = translations[lang][key];
  });
  const select = document.getElementById('lang-select');
  if (select) select.value = lang;
}

function detectBrowserLang(enabledLangs) {
  const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (nav.startsWith('mr') && enabledLangs.includes('mr')) return 'mr';
  if (nav.startsWith('hi') && enabledLangs.includes('hi')) return 'hi';
  if (nav.startsWith('en') && enabledLangs.includes('en')) return 'en';
  return null;
}

function initLanguage(enabledLangs, defaultLang) {
  enabledLangs = enabledLangs && enabledLangs.length ? enabledLangs : ['en', 'mr', 'hi'];
  const saved = localStorage.getItem('lang');
  let lang;
  if (saved && enabledLangs.includes(saved)) {
    lang = saved; // user previously chose a language
  } else {
    // 1) try browser language  2) owner default  3) first enabled
    lang = detectBrowserLang(enabledLangs) || defaultLang || enabledLangs[0] || 'en';
    if (!enabledLangs.includes(lang)) lang = enabledLangs[0] || 'en';
  }
  const select = document.getElementById('lang-select');
  if (select) {
    Array.from(select.options).forEach(opt => {
      if (!enabledLangs.includes(opt.value)) opt.style.display = 'none';
    });
    select.addEventListener('change', () => setLanguage(select.value));
  }
  setLanguage(lang);
}

window.i18n = { setLanguage, initLanguage, t: (key) => translations[currentLang][key] || key };
