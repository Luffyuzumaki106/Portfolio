import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { useReducedMotion } from '../hooks/useReducedMotion';

const BIO_LINES = [
  'I am an AI artist creating 3D cartoons, realistic AI video, animation and branding visuals.',
  'I turn scripts and ideas into finished videos, from kids\u2019 nursery rhymes to Indian mythology and story-driven series.',
  'Currently with SQB working on Pocket FM projects, and available for freelance and remote collaborations.',
];

export default function About() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="01 // ABOUT"
          title="Crafting Stories Frame by Frame"
        />

        <div className="glass-card rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-[#E0447C]/10 rounded-full blur-[90px] pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-4xl space-y-5">
            {BIO_LINES.map((line, idx) => (
              <div key={line} className="overflow-hidden">
                <motion.p
                  initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.6,
                    delay: reducedMotion ? 0 : idx * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`leading-relaxed ${
                    idx === 0
                      ? 'font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-[#1A1222] dark:text-[#F6F2F8]'
                      : 'text-base sm:text-lg text-[#4A3F55] dark:text-[#B8AEBF]'
                  }`}
                >
                  {line}
                </motion.p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
