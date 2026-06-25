import React, { useEffect, useRef, useState } from 'react';

/**
 * Modern Meteor Rain — canvas meteor shower over a twinkling starfield.
 *
 * Rendering notes:
 * - The canvas is a transparent overlay, so each frame is cleared with
 *   clearRect (NOT a translucent black fill, which muddies the background).
 * - Meteor heads/tails are drawn with additive blending ('lighter') for a
 *   soft glow that brightens where trails overlap.
 * - Honors prefers-reduced-motion: renders a static starfield, no motion.
 */
export default function MeteorRain({
  enabled = true,
  meteorCount = 16,
  speed = 1.2,
  palette = ['rgba(96, 165, 250, 0.95)', 'rgba(167, 139, 250, 0.95)', 'rgba(244, 114, 182, 0.95)', 'rgba(94, 234, 212, 0.95)'],
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const meteorsRef = useRef([]);
  const starsRef = useRef([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [reduced, setReduced] = useState(false);

  class Meteor {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.reset(true);
    }

    reset(initial = false) {
      // Start above/right of the viewport so meteors streak in diagonally.
      this.x = Math.random() * this.width * 1.2 - this.width * 0.1;
      this.y = -120 - Math.random() * 240;
      if (initial) this.y = Math.random() * this.height - this.height; // spread on first paint

      this.hero = Math.random() < 0.12; // occasional brighter, longer meteor
      this.speed = (2 + Math.random() * 3) * speed * (this.hero ? 1.4 : 1);
      this.length = (this.hero ? 130 : 60) + Math.random() * 90;
      this.size = (this.hero ? 1.8 : 1) + Math.random() * 1.4;
      this.color = palette[Math.floor(Math.random() * palette.length)];

      this.opacity = 0;
      this.fadeIn = true;
      this.maxOpacity = (this.hero ? 0.85 : 0.55) + Math.random() * 0.3;
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25;
    }

    update() {
      if (this.fadeIn) {
        this.opacity += 0.04;
        if (this.opacity >= this.maxOpacity) this.fadeIn = false;
      } else {
        this.opacity -= 0.006;
      }

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if (this.y > this.height + 120 || this.x > this.width + 120 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = this.opacity;

      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const tail = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      tail.addColorStop(0, this.color);
      tail.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.strokeStyle = tail;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      const r = this.size * (this.hero ? 6 : 4);
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      glow.addColorStop(0.35, this.color);
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const update = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!enabled || !dimensions.width) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const { width: w, height: h } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Twinkling starfield (density scales with viewport area).
    const starCount = Math.min(140, Math.round((w * h) / 11000));
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      base: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      twSpeed: 0.5 + Math.random() * 1.6,
    }));

    const drawStars = (t) => {
      ctx.save();
      for (const s of starsRef.current) {
        const tw = t === null ? 1 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.twSpeed + s.phase));
        ctx.globalAlpha = s.base * tw;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    // Reduced motion: paint a static sky once and stop.
    if (reduced) {
      ctx.clearRect(0, 0, w, h);
      drawStars(null);
      return;
    }

    meteorsRef.current = Array.from({ length: meteorCount }, () => new Meteor(w, h));

    let lastTime = 0;
    const animate = (currentTime) => {
      const dt = currentTime - lastTime;
      if (dt < 16) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;
      const t = currentTime / 1000;

      ctx.clearRect(0, 0, w, h);
      drawStars(t);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      meteorsRef.current.forEach((m) => {
        m.update();
        m.draw(ctx);
      });
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [enabled, dimensions, meteorCount, speed, palette, reduced]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: dimensions.width, height: dimensions.height, opacity: 0.75 }}
    />
  );
}
