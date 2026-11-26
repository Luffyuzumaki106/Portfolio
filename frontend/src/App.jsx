import { useCallback, useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsStrip from './components/StatsStrip';
import About from './components/About';
import Services from './components/Services';
import Projects from './components/Projects';
import ProjectModal from './components/ProjectModal';
import FeaturedAchievement from './components/FeaturedAchievement';
import Workflow from './components/Workflow';
import ExperienceEducation from './components/ExperienceEducation';
import SkillsTools from './components/SkillsTools';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/admin/AdminPanel';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useReducedMotion } from './hooks/useReducedMotion';
import { THEME_STORAGE_KEY } from './utils/storage';

gsap.registerPlugin(ScrollTrigger);

function isAdminLocation() {
  return window.location.pathname.replace(/\/+$/, '') === '/admin';
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const portfolio = usePortfolioData();

  const [isAdminRoute, setIsAdminRoute] = useState(isAdminLocation);
  const [selectedProject, setSelectedProject] = useState(null);
  const [lenisInstance, setLenisInstance] = useState(null);

  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors for theme preference
    }
  }, [theme]);

  useEffect(() => {
    const syncRoute = () => setIsAdminRoute(isAdminLocation());
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  // Sync Lenis smooth scroll with GSAP ScrollTrigger
  useEffect(() => {
    if (isAdminRoute || reducedMotion) {
      setLenisInstance(null);
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    setLenisInstance(lenis);
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [isAdminRoute, reducedMotion]);

  const handleNavigate = useCallback(
    (id) => {
      const target = document.getElementById(id);
      if (!target) return;
      if (lenisInstance) {
        lenisInstance.scrollTo(target, { offset: -72 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [lenisInstance]
  );

  const handleBackToTop = useCallback(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [lenisInstance]);

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#FAF7FC] dark:bg-[#0B0710] text-[#1A1222] dark:text-[#F6F2F8]">
        <AdminPanel
          data={portfolio.data}
          loading={portfolio.loading}
          saving={portfolio.saving}
          apiError={portfolio.apiError}
          clearApiError={portfolio.clearApiError}
          onRefreshPortfolio={portfolio.refresh}
          onCreateProject={portfolio.createProject}
          onUpdateProject={portfolio.updateProject}
          onDeleteProject={portfolio.deleteProject}
          onReorderProjects={portfolio.reorderProjects}
          onToggleFeatured={portfolio.toggleFeatured}
          onSaveSiteMedia={portfolio.saveSiteMedia}
          onImportPortfolio={portfolio.importPortfolioJson}
          onExitAdmin={() => {
            const homePath = window.location.pathname.replace(/\/admin\/?$/, '') || '/';
            window.history.pushState({}, '', `${homePath}${window.location.search}`);
            setIsAdminRoute(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAF7FC] dark:bg-[#0B0710] text-[#1A1222] dark:text-[#F6F2F8]">
      {/* Subtle film grain */}
      <div className="fixed inset-0 pointer-events-none z-[5] film-grain" aria-hidden="true" />

      <Preloader />
      <ScrollProgress />
      <CustomCursor />

      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        lenis={lenisInstance}
      />

      <main className="relative z-10">
        <Hero
          profilePhoto={portfolio.data.siteMedia?.profilePhoto}
          showreelUrl={portfolio.data.siteMedia?.showreelUrl}
          onNavigate={handleNavigate}
        />
        <StatsStrip />
        <About />
        <Services />
        <Projects
          projects={portfolio.data.projects}
          onSelectProject={setSelectedProject}
        />
        <FeaturedAchievement
          featuredVideoUrl={portfolio.data.siteMedia?.featuredVideoUrl}
        />
        <Workflow />
        <ExperienceEducation />
        <SkillsTools />
        <Contact />
      </main>

      <Footer onBackToTop={handleBackToTop} />

      <ProjectModal
        project={selectedProject}
        projects={portfolio.data.projects}
        onClose={() => setSelectedProject(null)}
        onSelectProject={setSelectedProject}
      />
    </div>
  );
}
