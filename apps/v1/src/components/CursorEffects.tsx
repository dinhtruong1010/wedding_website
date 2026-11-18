import { useEffect } from 'react';

/**
 * Cute pointer effects, implemented with plain DOM nodes + CSS keyframes so they
 * never trigger React re-renders:
 *  - a soft trail of tiny hearts that follows the mouse (fine pointers only)
 *  - a burst of hearts and a ripple ring on every click / tap
 * Disabled entirely when the user prefers reduced motion.
 */

const TRAIL_INTERVAL_MS = 45;
const TRAIL_MIN_DISTANCE = 14;
const MAX_PARTICLES = 60;
const TRAIL_COLORS = ['#f7b6c7', '#e88aa5', '#f9c9d6', '#d4708f'];
const BURST_GLYPHS = ['♥', '♥', '✿', '♥'];

export const CursorEffects = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = document.createElement('div');
    layer.className = 'cursor-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    let lastTime = 0;
    let lastX = -999;
    let lastY = -999;
    let colorIndex = 0;

    const spawn = (className: string, x: number, y: number, text: string, style: Record<string, string>) => {
      if (layer.childElementCount >= MAX_PARTICLES) layer.firstElementChild?.remove();
      const node = document.createElement('span');
      node.className = className;
      node.textContent = text;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      Object.entries(style).forEach(([key, value]) => node.style.setProperty(key, value));
      node.addEventListener('animationend', () => node.remove(), { once: true });
      layer.appendChild(node);
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const now = performance.now();
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      if (now - lastTime < TRAIL_INTERVAL_MS || distance < TRAIL_MIN_DISTANCE) return;
      lastTime = now;
      lastX = event.clientX;
      lastY = event.clientY;
      colorIndex = (colorIndex + 1) % TRAIL_COLORS.length;
      spawn('cursor-trail', event.clientX, event.clientY, '♥', {
        '--c': TRAIL_COLORS[colorIndex],
        '--s': `${8 + Math.random() * 6}px`,
        '--dx': `${(Math.random() - 0.5) * 24}px`,
        '--rot': `${(Math.random() - 0.5) * 50}deg`,
      });
    };

    const handleDown = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;
      spawn('cursor-ripple', x, y, '', {});
      const count = 8;
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2 + Math.random() * 0.4;
        const radius = 34 + Math.random() * 26;
        spawn('cursor-burst', x, y, BURST_GLYPHS[index % BURST_GLYPHS.length], {
          '--c': TRAIL_COLORS[index % TRAIL_COLORS.length],
          '--s': `${10 + Math.random() * 8}px`,
          '--tx': `${Math.cos(angle) * radius}px`,
          '--ty': `${Math.sin(angle) * radius}px`,
          '--rot': `${(Math.random() - 0.5) * 90}deg`,
        });
      }
    };

    if (hasFinePointer) window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      layer.remove();
    };
  }, []);

  return null;
};
