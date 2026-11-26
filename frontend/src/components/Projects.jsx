import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Film, Play, Star } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { isGoogleDriveLink } from '../utils/googleDrive';
import { resolveMediaUrl } from '../api/client';

const CATEGORIES = ['All', '3D Cartoon', 'Mythology', 'Story Series', 'Editing', 'Branding'];

export default function Projects({ projects, onSelectProject }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const reducedMotion = useReducedMotion();

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <section id="projects" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="03 // SELECTED WORK"
          title="Projects & Reels"
          subtitle="Open a project to explore its details, or view Drive-linked work directly."
        />

        {/* Category Filter Tabs */}
        <div
          className="flex flex-wrap gap-2 mb-10"
          role="tablist"
          aria-label="Filter projects by category"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 min-h-[44px] rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white shadow-md shadow-[#E0447C]/25'
                    : 'glass-card text-[#4A3F55] dark:text-[#B8AEBF] hover:text-[#1A1222] dark:hover:text-[#F6F2F8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Film className="w-10 h-10 text-[#E0447C] mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-display text-xl font-bold text-[#1A1222] dark:text-[#F6F2F8]">
              No projects in &ldquo;{activeCategory}&rdquo; yet
            </h3>
            <p className="text-sm text-[#544960] dark:text-[#B8AEBF] mt-1">
              Select another category or add a project from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => {
              const hasVideo = Boolean(project.videoLink && project.videoLink.trim());
              if (isGoogleDriveLink(project.driveLink || '')) {
                return (
                  <motion.a
                    key={project.id}
                    href={project.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    layout={!reducedMotion}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: reducedMotion ? 0 : idx * 0.06 }}
                    aria-label={`View ${project.title} on Google Drive`}
                    className="group glass-card rounded-2xl min-h-56 p-6 sm:p-8 flex flex-col items-center justify-center text-center hover:border-[#E0447C]/60 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-14 h-14 mb-5 transition-transform group-hover:scale-105"
                      aria-hidden="true"
                    >
                      <path fill="#00832D" d="M6.2 2h5.2L5.2 12.7 2.6 17.2 0 12.7z" />
                      <path fill="#FFBA00" d="M11.4 2h5.2L24 14.8h-5.2z" />
                      <path fill="#0066DA" d="M5.2 12.7h13.6L16.2 17.2H2.6z" />
                    </svg>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#1A1222] dark:text-[#F6F2F8] group-hover:text-[#E0447C] transition-colors">
                      {project.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#7A1248] dark:text-[#F5B85B]">
                      View on Google Drive
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </motion.a>
                );
              }

              return (
                <motion.article
                  key={project.id}
                  layout={!reducedMotion}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: reducedMotion ? 0 : idx * 0.06 }}
                  onClick={() => onSelectProject(project)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectProject(project);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open project ${project.title}`}
                  className="group glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col hover:border-[#E0447C]/60 transition-colors"
                >
                  {/* Banner */}
                  <div className="relative aspect-video overflow-hidden bg-[#140E1C]">
                    {project.bannerImage ? (
                      <img
                        src={resolveMediaUrl(project.bannerImage)}
                        alt={`${project.title} banner`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full transition-transform duration-500 group-hover:scale-105 flex items-center justify-center p-6"
                        style={{
                          background:
                            project.bannerGradient ||
                            'linear-gradient(135deg, #7A1248 0%, #E0447C 60%, #F5B85B 100%)',
                        }}
                      >
                        <span className="font-display text-xl sm:text-2xl font-extrabold text-white/90 text-center drop-shadow">
                          {project.title}
                        </span>
                      </div>
                    )}

                    {/* Category & Featured badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#0B0710]/75 text-[#F6F2F8] backdrop-blur-md border border-white/10">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-mono bg-[#F5B85B]/90 text-[#0B0710] font-semibold inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    {/* Play button ONLY when videoLink is non-empty */}
                    {hasVideo && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-90 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      >
                        <span className="w-12 h-12 rounded-full bg-[#E0447C] text-white flex items-center justify-center shadow-lg shadow-[#E0447C]/40 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#1A1222] dark:text-[#F6F2F8] group-hover:text-[#E0447C] transition-colors">
                        {project.title}
                      </h3>
                      <ArrowUpRight
                        className="w-5 h-5 text-[#B8AEBF] group-hover:text-[#F5B85B] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="mt-2 text-sm text-[#4A3F55] dark:text-[#B8AEBF] line-clamp-2 flex-1">
                      {project.shortDescription}
                    </p>

                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex flex-wrap gap-1.5">
                      {(project.toolsUsed || []).slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-[#7A1248]/10 dark:bg-white/5 text-[#7A1248] dark:text-[#F5B85B]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
