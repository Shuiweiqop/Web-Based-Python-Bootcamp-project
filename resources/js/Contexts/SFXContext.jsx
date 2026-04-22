import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const SFXContext = createContext();

let sharedAudioContext = null;

const getAudioContext = async () => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    await sharedAudioContext.resume();
  }
  return sharedAudioContext;
};

const generateSFX = async (type) => {
  try {
    const audioContext = await getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const effects = {
      click: { freq: 800, duration: 50, type: 'sine' },
      hover: { freq: 600, duration: 30, type: 'sine' },
      toggle: { freq: 600, duration: 100, type: 'square' },
      skip: { freq: 1000, duration: 80, type: 'triangle' },
      shuffle: { freq: 700, duration: 90, type: 'sine' },
      success: { freq: 1200, duration: 120, type: 'sine' },
      error: { freq: 300, duration: 150, type: 'sawtooth' },
      nav: { freq: 1000, duration: 60, type: 'triangle' },
      dropdown: { freq: 700, duration: 80, type: 'square' },
      points: { freq: 1400, duration: 120, type: 'sine' },
    };

    const effect = effects[type] || effects.click;

    oscillator.frequency.value = effect.freq;
    oscillator.type = effect.type;

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + effect.duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + effect.duration / 1000);
  } catch (error) {
    // Keep silent in production UX; failing audio should never block UI.
    console.warn(`SFX generation failed for ${type}:`, error);
  }
};

const isInteractiveElement = (target) => {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      [
        'button',
        'a',
        '[role="button"]',
        '[role="menuitem"]',
        '[role="tab"]',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        'label[for]',
        'summary',
        '[tabindex]:not([tabindex="-1"])',
        '[onclick]',
        '[data-sfx]',
        '.sfx-click',
        '.card-hover-effect',
        '.cursor-pointer',
      ].join(', ')
    )
  );
};

export function SFXProvider({ children }) {
  const [sfxEnabled, setSfxEnabled] = useState(() => {
    const stored = sessionStorage.getItem('sfxEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  });

  const lastManualPlayAtRef = useRef(0);
  const lastHoverTargetRef = useRef(null);
  const lastHoverAtRef = useRef(0);
  const hasUserGestureRef = useRef(false);

  useEffect(() => {
    sessionStorage.setItem('sfxEnabled', JSON.stringify(sfxEnabled));
  }, [sfxEnabled]);

  const playSFX = useCallback(
    (type = 'click') => {
      if (sfxEnabled) {
        lastManualPlayAtRef.current = Date.now();
        generateSFX(type);
      }
    },
    [sfxEnabled]
  );

  const toggleSFX = useCallback(() => {
    setSfxEnabled((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => generateSFX('success'), 100);
      }
      return next;
    });
  }, []);

  // Global fallback binding so nav bars, links, and interactive cards always have click SFX.
  useEffect(() => {
    if (!sfxEnabled) return undefined;

    const onPointerDown = (e) => {
      hasUserGestureRef.current = true;

      // If a manual play just happened on this interaction, skip fallback to avoid double sound.
      if (Date.now() - lastManualPlayAtRef.current < 120) {
        return;
      }

      if (isInteractiveElement(e.target)) {
        playSFX('click');
      }
    };

    const handleHoverTarget = (target) => {
      // Browser autoplay policy: ensure at least one user gesture happened.
      if (!hasUserGestureRef.current) return;
      if (!target) return;

      const interactive = target.closest(
        [
          'button',
          'a',
          '[role="button"]',
          '[role="menuitem"]',
          '[role="tab"]',
          'input:not([type="hidden"])',
          'select',
          'textarea',
          'label[for]',
          'summary',
          '[tabindex]:not([tabindex="-1"])',
          '[onclick]',
          '[data-sfx]',
          '.sfx-hover',
          '.sfx-click',
          '.card-hover-effect',
          '.cursor-pointer',
        ].join(', ')
      );

      if (!interactive) return;
      if (Date.now() - lastManualPlayAtRef.current < 120) return;

      const now = Date.now();
      const sameTarget = interactive === lastHoverTargetRef.current;
      const tooSoon = now - lastHoverAtRef.current < 180;
      if (sameTarget && tooSoon) return;
      if (tooSoon) return;

      lastHoverTargetRef.current = interactive;
      lastHoverAtRef.current = now;
      playSFX('hover');
    };

    const onMouseOver = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      handleHoverTarget(target);
    };

    const onFocusIn = (e) => {
      // Keyboard/tab navigation should also get hover-like feedback.
      const target = e.target instanceof Element ? e.target : null;
      handleHoverTarget(target);
    };

    const onKeyDown = (e) => {
      hasUserGestureRef.current = true;

      // Enter/Space on focused interactive controls should also have SFX.
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!isInteractiveElement(e.target)) return;
      if (Date.now() - lastManualPlayAtRef.current < 120) return;
      playSFX('click');
    };

    // pointerdown fires before navigation, so users hear sound even when route changes immediately.
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('mouseover', onMouseOver, true);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [playSFX, sfxEnabled]);

  const value = {
    sfxEnabled,
    setSfxEnabled,
    toggleSFX,
    playSFX,
  };

  return <SFXContext.Provider value={value}>{children}</SFXContext.Provider>;
}

export function useSFX() {
  const context = useContext(SFXContext);
  if (!context) {
    throw new Error('useSFX must be used within SFXProvider');
  }
  return context;
}

export default SFXContext;
