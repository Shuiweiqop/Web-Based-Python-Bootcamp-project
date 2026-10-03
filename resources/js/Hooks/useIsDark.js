import { useEffect, useState } from 'react';

// Tracks the `dark` class on <html>, which the theme toggle flips and then
// announces with a `theme-changed` event.
export default function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  return isDark;
}
