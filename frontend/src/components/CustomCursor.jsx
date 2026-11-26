import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const cursorRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') {
      setEnabled(false);
      return;
    }

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isDesktop = window.innerWidth >= 1024;
    if (!isFinePointer || !isDesktop) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    let rafId = null;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const onOver = (e) => {
      const interactive = e.target.closest('a, button, [role="button"], input, textarea, select');
      setHovering(Boolean(interactive));
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${hovering ? 1.55 : 1})`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, hovering]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 z-[90] pointer-events-none rounded-full border transition-[width,height,background-color,border-color] duration-200 will-change-transform ${
        hovering
          ? 'w-9 h-9 border-[#F5B85B] bg-[#E0447C]/15'
          : 'w-6 h-6 border-[#E0447C]/80 bg-transparent'
      }`}
    />
  );
}
