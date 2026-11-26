import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Eye, Film, Layers } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

function AnimatedCounter({ target, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setValue(target);
      return;
    }

    const duration = 1100;
    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target, reducedMotion]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value);

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}

export default function StatsStrip() {
  return (
    <section aria-label="Key Metrics" className="relative py-8">
      <div className="film-strip-divider mb-8 opacity-75" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stat 1: 145k views */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="glass-card rounded-2xl p-6 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E0447C]/15 border border-[#E0447C]/30 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-[#E0447C]" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A1222] dark:text-[#F6F2F8]">
                <AnimatedCounter target={145} suffix="k" />
              </div>
              <p className="text-sm font-medium text-[#4A3F55] dark:text-[#F6F2F8] mt-1">
                Views on &ldquo;Aha Tamatar Bade Maze Daar&rdquo;
              </p>
              <p className="font-mono text-xs text-[#7A1248] dark:text-[#F5B85B] mt-0.5">
                Happy Tots Hindi &bull; YouTube
              </p>
            </div>
          </motion.div>

          {/* Stat 2: 2.5-3 min finished video per day */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="glass-card rounded-2xl p-6 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F5B85B]/15 border border-[#F5B85B]/30 flex items-center justify-center shrink-0">
              <Film className="w-6 h-6 text-[#F5B85B]" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A1222] dark:text-[#F6F2F8]">
                <AnimatedCounter target={2.5} decimals={1} />–<AnimatedCounter target={3} /> min
              </div>
              <p className="text-sm font-medium text-[#4A3F55] dark:text-[#F6F2F8] mt-1">
                Finished video per day
              </p>
              <p className="font-mono text-xs text-[#7A1248] dark:text-[#F5B85B] mt-0.5">
                With Seedance 2.5
              </p>
            </div>
          </motion.div>

          {/* Stat 3: 10 Tools */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="glass-card rounded-2xl p-6 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#7A1248]/20 border border-[#7A1248]/40 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-[#E0447C]" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#1A1222] dark:text-[#F6F2F8]">
                <AnimatedCounter target={10} />
              </div>
              <p className="text-sm font-medium text-[#4A3F55] dark:text-[#F6F2F8] mt-1">
                AI &amp; Editing Tools Mastered
              </p>
              <p className="font-mono text-xs text-[#7A1248] dark:text-[#F5B85B] mt-0.5">
                6 AI Models &bull; 4 Post-Production Suites
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="film-strip-divider mt-8 opacity-75" aria-hidden="true" />
    </section>
  );
}
