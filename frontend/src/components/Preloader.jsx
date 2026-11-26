import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Preloader({ onComplete }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      onComplete?.();
      return;
    }

    const t1 = setTimeout(() => setCount(2), 350);
    const t2 = setTimeout(() => setCount(1), 700);
    const t3 = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reducedMotion, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0710] text-[#F6F2F8]"
          aria-hidden="true"
        >
          <div className="relative flex items-center justify-center w-28 h-28 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                stroke="#E0447C"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={276.46}
                initial={{ strokeDashoffset: 276.46 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.05, ease: 'easeInOut' }}
              />
            </svg>
            <span className="absolute font-mono text-3xl font-semibold text-[#F5B85B]">
              0{count}
            </span>
          </div>

          <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7A1248] via-[#E0447C] to-[#F5B85B]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.05, ease: 'easeInOut' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <p className="mt-4 font-mono text-xs tracking-[0.25em] uppercase text-[#B8AEBF]">
            FS // REEL LOADING
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
