import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, MapPin, Play, Sparkles } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { resolveMediaUrl } from '../api/client';

const TITLES = ['AI Visual Artist', 'AI Filmmaker', 'AI Video Editor'];

export default function Hero({ profilePhoto, showreelUrl, onNavigate }) {
  const reducedMotion = useReducedMotion();
  const [titleIndex, setTitleIndex] = useState(0);
  const [photoError, setPhotoError] = useState(false);

  const resolvedProfilePhoto = resolveMediaUrl(profilePhoto);
  const resolvedShowreelUrl = resolveMediaUrl(showreelUrl);

  useEffect(() => {
    setPhotoError(false);
  }, [resolvedProfilePhoto]);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % TITLES.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const isDirectVideo =
    resolvedShowreelUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(resolvedShowreelUrl.trim());

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center pt-24 pb-16 sm:pt-28 sm:pb-24 overflow-hidden"
    >
      {/* Optional looping showreel background */}
      {isDirectVideo && !reducedMotion && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          src={resolvedShowreelUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      )}

      {/* Ambient cinematic glow */}
      <div
        className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#7A1248]/30 blur-[130px] pointer-events-none animate-pulse-glow"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[#E0447C]/20 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left column */}
          <div className="lg:col-span-7">
            <div className="inline-flex flex-wrap items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-card mb-6">
              <span className="w-2 h-2 rounded-full bg-[#E0447C] animate-pulse" aria-hidden="true" />
              <span className="font-mono text-xs tracking-wider uppercase text-[#544960] dark:text-[#B8AEBF]">
                Currently with SQB &bull; Available for Freelance &amp; Remote
              </span>
            </div>

            <div className="font-mono text-xs tracking-[0.2em] uppercase text-[#F5B85B] mb-2">
              REC &#9679; 00:00:01:24 // 24 FPS
            </div>

            <h1 className="font-display text-fluid-hero font-extrabold tracking-tight text-[#1A1222] dark:text-[#F6F2F8]">
              Faiz Siddiqui
            </h1>

            {/* Rotating Titles */}
            <div className="mt-3 h-10 sm:h-12 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={TITLES[titleIndex]}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="font-display text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#E0447C] via-[#F5B85B] to-[#E0447C] bg-clip-text text-transparent"
                >
                  {TITLES[titleIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <p className="mt-4 max-w-xl text-base sm:text-lg text-[#4A3F55] dark:text-[#B8AEBF] leading-relaxed">
              Turning scripts and ideas into finished videos — from 3D cartoon nursery rhymes
              to Indian mythology and story-driven AI series.
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-[#544960] dark:text-[#B8AEBF]">
              <MapPin className="w-4 h-4 text-[#E0447C]" aria-hidden="true" />
              <span>Delhi, India</span>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton
                type="button"
                onClick={() => onNavigate('projects')}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#7A1248] via-[#E0447C] to-[#E0447C] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#E0447C]/25 hover:shadow-[#E0447C]/40 transition-shadow gap-2"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>View My Work</span>
              </MagneticButton>

              <MagneticButton
                type="button"
                onClick={() => onNavigate('contact')}
                className="px-6 py-3.5 rounded-full glass-card font-semibold text-sm sm:text-base text-[#1A1222] dark:text-[#F6F2F8] hover:border-[#F5B85B]/70 transition-colors gap-2"
              >
                <span>Hire Me</span>
                <ArrowDownRight className="w-4 h-4 text-[#F5B85B]" aria-hidden="true" />
              </MagneticButton>
            </div>
          </div>

          {/* Right column: Portrait with viewfinder frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] p-3 glass-card rounded-2xl"
            >
              {/* Viewfinder frame corners */}
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-[#F5B85B] rounded-tl" aria-hidden="true" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-[#F5B85B] rounded-tr" aria-hidden="true" />
              <span className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-[#F5B85B] rounded-bl" aria-hidden="true" />
              <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-[#F5B85B] rounded-br" aria-hidden="true" />

              <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-[#1C0D24] via-[#7A1248] to-[#0B0710] flex items-center justify-center">
                {resolvedProfilePhoto && !photoError ? (
                  <img
                    src={resolvedProfilePhoto}
                    alt="Faiz Siddiqui — AI Visual Artist"
                    className="w-full h-full object-cover"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7A1248] via-[#E0447C] to-[#F5B85B] p-[2px] mb-4">
                      <div className="w-full h-full rounded-full bg-[#0B0710] flex items-center justify-center">
                        <span className="font-display text-3xl font-extrabold text-[#F6F2F8]">
                          FS
                        </span>
                      </div>
                    </div>
                    <p className="font-display font-bold text-lg text-[#F6F2F8]">
                      Faiz Siddiqui
                    </p>
                    <p className="font-mono text-xs text-[#F5B85B] mt-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>AI Visual Artist</span>
                    </p>
                  </div>
                )}

                {/* Bottom timecode overlay */}
                <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-[#0B0710]/75 backdrop-blur-md border border-white/10 flex items-center justify-between font-mono text-[11px] text-[#F6F2F8]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E0447C]" />
                    <span>DELHI, IN</span>
                  </span>
                  <span className="text-[#F5B85B]">SQB // PRISMART</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
