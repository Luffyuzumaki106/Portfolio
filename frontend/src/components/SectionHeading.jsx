import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function SectionHeading({ timecode, title, subtitle }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mb-10 md:mb-14">
      {timecode && (
        <div className="flex items-center gap-2 font-mono text-xs tracking-[0.22em] uppercase text-[#E0447C] mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E0447C]" aria-hidden="true" />
          <span>{timecode}</span>
        </div>
      )}
      <h2 className="font-display text-fluid-h2 font-bold tracking-tight text-[#1A1222] dark:text-[#F6F2F8]">
        {title}
      </h2>
      <motion.div
        initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="h-[3px] w-24 mt-3 rounded-full bg-gradient-to-r from-[#7A1248] via-[#E0447C] to-[#F5B85B] origin-left"
      />
      {subtitle && (
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#544960] dark:text-[#B8AEBF]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
