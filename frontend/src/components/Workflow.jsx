import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2, FileText, Film, Image, Scissors, UserCheck } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { label: 'Script', detail: 'Story breakdown, beats, and pacing plan', icon: FileText },
  { label: 'Character Design', detail: 'Consistent visual identity and style', icon: UserCheck },
  { label: 'Image Generation', detail: 'Keyframes, lighting, and framing', icon: Image },
  { label: 'Video Generation', detail: 'Motion synthesis with AI video models', icon: Film },
  { label: 'Editing', detail: 'Sound design, cuts, color, and VFX', icon: Scissors },
  { label: 'Final Delivery', detail: 'Polished export ready for release', icon: CheckCircle2 },
];

export default function Workflow() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !pathRef.current || !sectionRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'bottom 65%',
          scrub: 0.7,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="workflow" ref={sectionRef} className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="05 // PIPELINE"
          title="Production Workflow"
          subtitle="A repeatable script-to-screen pipeline built for clarity, consistency, and fast turnaround."
        />

        <div className="relative">
          {/* Desktop SVG connecting line drawn on scroll */}
          <svg
            className="hidden lg:block absolute top-11 left-8 right-8 w-[calc(100%-4rem)] h-6 pointer-events-none"
            viewBox="0 0 1000 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="12"
              x2="1000"
              y2="12"
              stroke="rgba(224,68,124,0.18)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <path
              ref={pathRef}
              d="M 0 12 L 1000 12"
              fill="none"
              stroke="url(#workflowGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="workflowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7A1248" />
                <stop offset="50%" stopColor="#E0447C" />
                <stop offset="100%" stopColor="#F5B85B" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="glass-card rounded-2xl p-5 flex flex-col items-start relative"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#0B0710] dark:bg-[#1E142B] border border-[#E0447C]/40 flex items-center justify-center mb-4 shadow-md">
                    <Icon className="w-5 h-5 text-[#F5B85B]" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[11px] text-[#E0447C] uppercase tracking-wider">
                    Step 0{idx + 1}
                  </span>
                  <h3 className="font-display text-base font-bold text-[#1A1222] dark:text-[#F6F2F8] mt-1">
                    {step.label}
                  </h3>
                  <p className="text-xs text-[#544960] dark:text-[#B8AEBF] mt-1.5 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
