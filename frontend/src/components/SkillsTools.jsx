import SectionHeading from './SectionHeading';

const GROUPS = [
  {
    title: 'Core Skills',
    accent: 'border-[#E0447C]/35 text-[#E0447C]',
    items: ['3D Cartoon', 'AI Video', 'Script-to-Video', 'Animation', 'Branding', 'Storytelling'],
  },
  {
    title: 'AI Tools',
    accent: 'border-[#F5B85B]/35 text-[#7A1248] dark:text-[#F5B85B]',
    items: ['Seedance 2.5', 'Kling', 'MiniMax Hailuo', 'Omni Flash', 'Nano Banana', 'ChatGPT'],
  },
  {
    title: 'Editing Tools',
    accent: 'border-[#7A1248]/35 text-[#1A1222] dark:text-[#F6F2F8]',
    items: ['After Effects', 'Premiere Pro', 'Wondershare Filmora', 'Photoshop'],
  },
];

const MARQUEE_ITEMS = [
  'Seedance 2.5',
  'Kling',
  'MiniMax Hailuo',
  'Omni Flash',
  'Nano Banana',
  'ChatGPT',
  'After Effects',
  'Premiere Pro',
  'Wondershare Filmora',
  'Photoshop',
];

export default function SkillsTools() {
  return (
    <section id="tools" className="py-20 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="07 // STACK"
          title="Skills & Tools"
          subtitle="A focused toolkit combining generative AI video models with industry-standard post-production."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {GROUPS.map((group) => (
            <div key={group.title} className="glass-card rounded-2xl p-6 sm:p-7">
              <h3 className="font-display text-lg font-bold text-[#1A1222] dark:text-[#F6F2F8] mb-4">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium border bg-black/[0.03] dark:bg-white/[0.04] ${group.accent}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite CSS Marquee */}
      <div className="mt-12 border-y border-[#7A1248]/20 dark:border-white/10 py-4 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex w-max animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div key={`${item}-${idx}`} className="flex items-center">
              <span className="font-display font-bold text-lg sm:text-xl text-[#4A3F55] dark:text-[#B8AEBF] px-6 whitespace-nowrap">
                {item}
              </span>
              <span className="text-[#E0447C]" aria-hidden="true">
                &#9670;
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
