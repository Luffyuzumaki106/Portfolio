import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Play, Youtube } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { parseVideoUrl } from '../utils/videoEmbed';
import { isGoogleDriveLink } from '../utils/googleDrive';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function FeaturedAchievement({ featuredVideoUrl }) {
  const [loaded, setLoaded] = useState(false);
  const reducedMotion = useReducedMotion();
  const videoInfo = parseVideoUrl(featuredVideoUrl);
  const isDrive = isGoogleDriveLink(featuredVideoUrl || '');

  return (
    <section id="achievement" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="04 // MILESTONE"
          title="Featured Achievement"
        />

        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="glass-card rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left Info */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5B85B]/15 border border-[#F5B85B]/30 text-[#7A1248] dark:text-[#F5B85B] font-mono text-xs uppercase w-fit mb-5">
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>145k+ Views Milestone</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A1222] dark:text-[#F6F2F8]">
              &ldquo;Aha Tamatar Bade Maze Daar&rdquo;
            </h3>
            <p className="mt-2 font-mono text-xs sm:text-sm text-[#E0447C]">
              Happy Tots Hindi &bull; YouTube
            </p>
            <p className="mt-4 text-sm sm:text-base text-[#4A3F55] dark:text-[#B8AEBF] leading-relaxed">
              AI-generated 3D cartoon nursery rhyme produced during my work on the Happy Tots
              network at Prismart, reaching 145,000+ organic views on YouTube.
            </p>

            {isDrive && (
              <a
                href={featuredVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#E0447C] hover:text-[#F5B85B] transition-colors w-fit min-h-[44px]"
              >
                <span>Open on Google Drive</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
          </div>

          {/* Right Lazy Video Player */}
          <div className="lg:col-span-7 relative aspect-video bg-gradient-to-br from-[#1C0B24] via-[#7A1248] to-[#0B0710] flex items-center justify-center">
            {loaded && videoInfo?.type === 'iframe' ? (
              <iframe
                src={videoInfo.embedUrl}
                title="Aha Tamatar Bade Maze Daar — Happy Tots Hindi"
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : videoInfo ? (
              <button
                type="button"
                onClick={() => setLoaded(true)}
                aria-label={`Play Aha Tamatar Bade Maze Daar (${videoInfo.provider})`}
                className="relative w-full h-full flex flex-col items-center justify-center group"
              >
                {videoInfo.thumbnailUrl && (
                  <img
                    src={videoInfo.thumbnailUrl}
                    alt="Aha Tamatar Bade Maze Daar thumbnail"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity"
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-3 px-4">
                  <span className="w-16 h-16 rounded-full bg-[#E0447C] text-white flex items-center justify-center shadow-xl shadow-[#E0447C]/40 group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-black/70 text-white font-mono text-xs backdrop-blur-md">
                    {videoInfo.provider === 'YouTube'
                      ? 'Click to Load YouTube Player'
                      : 'Click to Play Video'}
                  </span>
                </div>
              </button>
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-4">
                  <Youtube className="w-8 h-8 text-[#F5B85B]" aria-hidden="true" />
                </div>
                <p className="font-display font-bold text-lg text-white">
                  145k Views on YouTube
                </p>
                <p className="text-xs sm:text-sm text-[#B8AEBF] mt-1 max-w-sm">
                  Happy Tots Hindi &bull; AI 3D Cartoon Nursery Rhyme
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
