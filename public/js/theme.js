const THEME_PRESETS = {
  normal: {
    primary: '#1a365d',
    secondary: '#3182ce',
    button: '#3182ce',
    text: '#1a202c',
    bg: '#f7fafc',
    cardBg: '#ffffff'
  },
  dark: {
    primary: '#e2e8f0',
    secondary: '#f6e05e',
    button: '#f6e05e',
    text: '#e2e8f0',
    bg: '#1a202c',
    cardBg: '#2d3748'
  },
  premium: {
    primary: '#1a365d',
    secondary: '#c9a227',
    button: '#c9a227',
    text: '#1a202c',
    bg: '#f8f9fa',
    cardBg: '#ffffff'
  }
};

function applyTheme(settings) {
  if (!settings) settings = {};
  const body = document.body;
  body.classList.remove('theme-normal', 'theme-dark', 'theme-premium', 'theme-custom');
  body.classList.remove(
    'festival-diwali', 'festival-holi', 'festival-ganesh',
    'festival-christmas', 'festival-newyear', 'festival-independence', 'festival-republic'
  );

  const theme = settings.theme || 'premium';
  body.classList.add('theme-' + theme);

  const root = document.documentElement;
  let colors;

  if (theme === 'custom') {
    colors = {
      primary: settings.primaryColor || '#1a365d',
      secondary: settings.secondaryColor || '#c9a227',
      button: settings.buttonColor || '#c9a227',
      text: settings.textColor || '#1a202c',
      bg: settings.bgColor || '#f8f9fa',
      cardBg: settings.cardBgColor || '#ffffff'
    };
  } else {
    const preset = THEME_PRESETS[theme] || THEME_PRESETS.premium;
    colors = {
      primary: settings.primaryColor || preset.primary,
      secondary: settings.secondaryColor || preset.secondary,
      button: settings.buttonColor || preset.button,
      text: preset.text,
      bg: preset.bg,
      cardBg: preset.cardBg
    };
  }

  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--button', colors.button);
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--bg', colors.bg);
  root.style.setProperty('--card-bg', colors.cardBg);

  if (settings.festivalTheme) {
    const now = new Date();
    let active = true;
    if (settings.festivalStart) {
      const start = new Date(settings.festivalStart);
      start.setHours(0, 0, 0, 0);
      active = active && now >= start;
    }
    if (settings.festivalEnd) {
      const end = new Date(settings.festivalEnd);
      end.setHours(23, 59, 59, 999);
      active = active && now <= end;
    }
    if (active) {
      body.classList.add('festival-' + settings.festivalTheme);
    }
  }
}

window.applyTheme = applyTheme;
window.THEME_PRESETS = THEME_PRESETS;
