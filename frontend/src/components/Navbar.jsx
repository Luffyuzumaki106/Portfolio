import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'projects', label: 'Work' },
  { id: 'workflow', label: 'Process' },
  { id: 'experience', label: 'Experience' },
  { id: 'tools', label: 'Tools' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar({ theme, onToggleTheme, lenis }) {
  const [activeId, setActiveId] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0.05 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id) => {
    setMobileOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -72 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF7FC]/85 dark:bg-[#0B0710]/85 backdrop-blur-xl border-b border-[#7A1248]/15 dark:border-white/10 shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between"
        aria-label="Primary Navigation"
      >
        {/* Logo FS with viewfinder corners */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('hero');
          }}
          className="relative inline-flex items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px] font-display font-extrabold text-xl tracking-wider text-[#1A1222] dark:text-[#F6F2F8] group"
          aria-label="Faiz Siddiqui Home"
        >
          <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#F5B85B] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#F5B85B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#F5B85B] transition-transform group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#F5B85B] transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          <span>FS</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3 py-2 min-h-[44px] text-sm font-medium transition-colors rounded-lg ${
                    isActive
                      ? 'text-[#E0447C]'
                      : 'text-[#4A3F55] dark:text-[#B8AEBF] hover:text-[#1A1222] dark:hover:text-[#F6F2F8]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute bottom-1.5 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-[#E0447C] to-[#F5B85B]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full glass-card text-[#1A1222] dark:text-[#F6F2F8] hover:border-[#E0447C]/60 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[#F5B85B]" /> : <Moon className="w-5 h-5 text-[#7A1248]" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full glass-card text-[#1A1222] dark:text-[#F6F2F8]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-[#FAF7FC]/95 dark:bg-[#0B0710]/95 backdrop-blur-xl border-b border-[#7A1248]/20 dark:border-white/10"
          >
            <ul className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeId === link.id;
                return (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full text-left px-4 min-h-[44px] rounded-xl text-base font-medium transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-[#E0447C]/15 text-[#E0447C]'
                          : 'text-[#1A1222] dark:text-[#F6F2F8] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#F5B85B]" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
