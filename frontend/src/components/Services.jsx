import { motion } from 'framer-motion';
import { Clapperboard, Film, Palette, Scissors, Sparkles, Wand2 } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SERVICES = [
  {
    title: '3D Cartoon Rhymes',
    description:
      'Expressive, kid-friendly 3D cartoon characters and musical nursery rhyme videos built for high YouTube engagement.',
    icon: Sparkles,
  },
  {
    title: 'Realistic AI Video',
    description:
      'Photorealistic AI scenes with consistent character framing, dramatic lighting, and natural motion.',
    icon: Film,
  },
  {
    title: 'AI Filmmaking (Script-to-Video)',
    description:
      'End-to-end transformation of written scripts into cohesive visual episodes for story-driven series and mythology.',
    icon: Clapperboard,
  },
  {
    title: 'Video Editing',
    description:
      'Tight pacing, sound sync, color grading, and compositing in Premiere Pro, After Effects, and Filmora.',
    icon: Scissors,
  },
  {
    title: 'Animation',
    description:
      'Dynamic motion graphics, character movement, and scene transitions that bring static concepts to life.',
    icon: Wand2,
  },
  {
    title: 'Branding Visuals',
    description:
      'Eye-catching promotional visuals, thumbnails, and brand storytelling assets tailored for digital campaigns.',
    icon: Palette,
  },
];

export default function Services() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="services" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="02 // SERVICES"
          title="What I Create"
          subtitle="From kids' 3D rhymes to realistic AI series and brand visuals, built for speed and visual polish."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.5,
                  delay: reducedMotion ? 0 : idx * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group glass-card rounded-2xl p-6 sm:p-7 hover:border-[#E0447C]/50 transition-colors relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7A1248]/25 to-[#E0447C]/20 border border-[#E0447C]/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 text-[#E0447C]" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#1A1222] dark:text-[#F6F2F8] mb-2.5">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-[#4A3F55] dark:text-[#B8AEBF] leading-relaxed">
                  {service.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
