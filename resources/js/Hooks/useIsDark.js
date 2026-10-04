import { useEffect, useState } from 'react';

// Whether the dark theme is on.
//
// AuthenticatedLayout owns the theme: it reads the saved choice from
// localStorage, sets the `dark` class on <html>, and announces each change
// with a `theme-changed` event. This follows it.
//
// The starting value matters on a full page load: a page renders before the
// layout's effect has put the class on <html>, so fall back to the saved
// choice the layout is about to apply (dark when there is none).
const currentTheme = () => {
  if (typeof document === 'undefined') return true;
  if (document.documentElement.classList.contains('dark')) return true;

  try {
    const saved = window.localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  } catch {
    return true;
  }
};

export default function useIsDark() {
  const [isDark, setIsDark] = useState(currentTheme);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  return isDark;
}
