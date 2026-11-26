import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase, GraduationCap } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const TIMELINE_ITEMS = [
  {
    type: 'experience',
    title: 'AI Artist',
    org: 'SQB',
    period: 'November 2026 – Present',
    bullets: ['Primarily working on Pocket FM projects.'],
  },
  {
    type: 'experience',
    title: 'AI Junior Artist',
    org: 'Prismart',
    period: 'July 2026 – October 2026',
    bullets: [
      'Happy Tots network (Happy Tots Hindi, Happy Tots, Happy Tots Nursery Rhymes): AI-generated 3D cartoon rhymes.',
      'Mahabharat and Ram Setu: AI video for Indian mythology client projects.',
      'Pocket FM, Alpha Bride: turned scripts into realistic AI video on an urgent client contract.',
      'Contributed to animation and branding projects for company clients.',
      'With Seedance 2.5, about 2.5 to 3 minutes of finished video per day; output time varies with other models.',
    ],
  },
  {
    type: 'education',
    title: 'BCA (Pursuing)',
    org: 'IGNOU',
    period: 'Ongoing',
    bullets: ['Bachelor of Computer Applications'],
  },
  {
    type: 'education',
    title: 'Class 12, Commerce',
    org: 'Kendriya Vidyalaya Tagore Garden (CBSE)',
    period: '2024',
    bullets: ['Score: 70.1%'],
  },
];

export default function ExperienceEducation() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !lineRef.current || !containerRef.current) return;

    const line = lineRef.current;
    const length = line.getTotalLength();
    gsap.set(line, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const ctx = gsap.context(() => {
      gsap.to(line, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'bottom 75%',
          scrub: 0.6,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="experience" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="06 // TIMELINE"
          title="Experience & Education"
        />

        <div ref={containerRef} className="relative pl-8 sm:pl-12">
          {/* Vertical scroll-drawn SVG line */}
          <svg
            className="absolute left-3 sm:left-5 top-2 bottom-2 w-2 h-[calc(100%-1rem)] pointer-events-none"
            viewBox="0 0 8 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="4"
              y1="0"
              x2="4"
              y2="1000"
              stroke="rgba(224,68,124,0.2)"
              strokeWidth="2"
            />
            <path
              ref={lineRef}
              d="M 4 0 L 4 1000"
              fill="none"
              stroke="#E0447C"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <div className="space-y-8">
            {TIMELINE_ITEMS.map((item) => {
              const Icon = item.type === 'experience' ? Briefcase : GraduationCap;
              return (
                <article
                  key={`${item.title}-${item.org}`}
                  className="relative glass-card rounded-2xl p-6 sm:p-8"
                >
                  {/* Node marker */}
                  <span
                    className="absolute -left-[29px] sm:-left-[41px] top-7 w-7 h-7 rounded-full bg-[#0B0710] border-2 border-[#F5B85B] flex items-center justify-center shadow"
                    aria-hidden="true"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#E0447C]" />
                  </span>

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#7A1248]/15 text-[#7A1248] dark:text-[#F5B85B]">
                      {item.type === 'experience' ? 'Experience' : 'Education'}
                    </span>
                    <span className="font-mono text-xs text-[#544960] dark:text-[#B8AEBF]">
                      {item.period}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A1222] dark:text-[#F6F2F8]">
                    {item.title}{' '}
                    <span className="text-[#E0447C]">— {item.org}</span>
                  </h3>

                  <ul className="mt-4 space-y-2 text-sm sm:text-base text-[#4A3F55] dark:text-[#B8AEBF]">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#F5B85B] mt-2 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
