import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Play, X } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoEmbed';
import { isGoogleDriveLink } from '../utils/googleDrive';

export default function ProjectModal({ project, projects, onClose, onSelectProject }) {
  const [playVideo, setPlayVideo] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    setPlayVideo(false);
    setPosterError(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];
  const videoInfo = parseVideoUrl(project.videoLink);
  const posterImage = !posterError
    ? project.bannerImage || videoInfo?.thumbnailUrl || ''
    : '';

  const externalLabel = project.externalLink
    ? isGoogleDriveLink(project.externalLink)
      ? 'Open on Google Drive'
      : parseVideoUrl(project.externalLink)?.provider === 'YouTube'
        ? 'Watch on YouTube'
        : 'Open External Link'
    : '';

  return (
    <AnimatePresence>
      <motion.div
        key="project-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <motion.div
          key={project.id}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl rounded-3xl bg-[#FAF7FC] dark:bg-[#140E1C] border border-[#7A1248]/25 dark:border-white/15 overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/60 text-white hover:bg-[#E0447C] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Area */}
          <div className="relative aspect-video w-full bg-[#0B0710] shrink-0">
            {playVideo && videoInfo ? (
              videoInfo.type === 'iframe' ? (
                <iframe
                  src={videoInfo.embedUrl}
                  title={project.title}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : videoInfo.type === 'video' ? (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
                  <p className="text-sm text-[#B8AEBF] mb-4">
                    This video opens on an external platform.
                  </p>
                  <a
                    href={videoInfo.embedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-full bg-[#E0447C] text-white font-semibold inline-flex items-center gap-2 min-h-[44px]"
                  >
                    <span>Watch Video</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )
            ) : (
              <>
                {posterImage ? (
                  <img
                    src={posterImage}
                    alt={project.title}
                    onError={() => setPosterError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center p-8"
                    style={{
                      background:
                        project.bannerGradient ||
                        'linear-gradient(135deg, #7A1248 0%, #E0447C 60%, #F5B85B 100%)',
                    }}
                  >
                    <span className="font-display text-2xl sm:text-4xl font-extrabold text-white text-center">
                      {project.title}
                    </span>
                  </div>
                )}

                {videoInfo && (
                  <button
                    type="button"
                    onClick={() => setPlayVideo(true)}
                    aria-label={`Play ${project.title} video`}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <span className="w-16 h-16 rounded-full bg-[#E0447C] text-white flex items-center justify-center shadow-xl shadow-[#E0447C]/40 hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Content Area */}
          <div className="p-6 sm:p-8 overflow-y-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#E0447C]/15 text-[#E0447C] font-semibold">
                {project.category}
              </span>
              {project.date && (
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/5 dark:bg-white/10 text-[#544960] dark:text-[#B8AEBF]">
                  {project.date}
                </span>
              )}
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A1222] dark:text-[#F6F2F8]">
              {project.title}
            </h3>

            {project.shortDescription && (
              <p className="mt-3 text-sm sm:text-base text-[#4A3F55] dark:text-[#B8AEBF] leading-relaxed">
                {project.shortDescription}
              </p>
            )}

            {/* Metadata grid */}
            {(project.role || project.client) && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                {project.role && (
                  <div>
                    <span className="block font-mono text-xs uppercase text-[#7A1248] dark:text-[#F5B85B]">
                      Role
                    </span>
                    <span className="text-sm font-medium text-[#1A1222] dark:text-[#F6F2F8]">
                      {project.role}
                    </span>
                  </div>
                )}
                {project.client && (
                  <div>
                    <span className="block font-mono text-xs uppercase text-[#7A1248] dark:text-[#F5B85B]">
                      Client
                    </span>
                    <span className="text-sm font-medium text-[#1A1222] dark:text-[#F6F2F8]">
                      {project.client}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tools */}
            {project.toolsUsed?.length > 0 && (
              <div className="mt-5">
                <span className="block font-mono text-xs uppercase text-[#544960] dark:text-[#B8AEBF] mb-2">
                  Tools Used
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 rounded-lg text-xs font-mono bg-[#7A1248]/10 dark:bg-white/10 text-[#7A1248] dark:text-[#F5B85B]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Link & Prev/Next */}
            <div className="mt-8 pt-5 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {projects.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSelectProject(prevProject)}
                      className="px-4 min-h-[44px] rounded-full glass-card text-sm font-medium inline-flex items-center gap-1.5 hover:border-[#E0447C]/50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProject(nextProject)}
                      className="px-4 min-h-[44px] rounded-full glass-card text-sm font-medium inline-flex items-center gap-1.5 hover:border-[#E0447C]/50"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {project.externalLink && (
                <a
                  href={project.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 min-h-[44px] rounded-full bg-[#E0447C] text-white text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90"
                >
                  <span>{externalLabel}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
