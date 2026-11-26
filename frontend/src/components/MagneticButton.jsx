import { useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function MagneticButton({
  children,
  className = '',
  as: Component = 'button',
  ...props
}) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <Component
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: offset.x === 0 && offset.y === 0 ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
      }}
      className={`inline-flex items-center justify-center min-h-[44px] will-change-transform ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
