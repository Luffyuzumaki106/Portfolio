import { ArrowUp, Lock } from 'lucide-react';

export default function Footer({ onBackToTop }) {
  return (
    <footer className="border-t border-[#7A1248]/20 dark:border-white/10 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="font-display font-bold text-lg text-[#1A1222] dark:text-[#F6F2F8]">
            Faiz Siddiqui
          </p>
          <p className="text-xs font-mono text-[#544960] dark:text-[#B8AEBF] mt-1">
            AI Visual Artist &bull; AI Filmmaker &bull; AI Video Editor &bull; Delhi, India
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href="https://behance.net/gallery/256917401/AI-Editing"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 min-h-[44px] inline-flex items-center text-[#544960] dark:text-[#B8AEBF] hover:text-[#E0447C] transition-colors"
          >
            Behance
          </a>
          <a
            href="https://wa.me/917827602563"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 min-h-[44px] inline-flex items-center text-[#544960] dark:text-[#B8AEBF] hover:text-[#E0447C] transition-colors"
          >
            WhatsApp
          </a>
          <a
            href="/admin"
            className="px-3 py-2 min-h-[44px] inline-flex items-center gap-1.5 text-[#544960] dark:text-[#B8AEBF] hover:text-[#F5B85B] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Admin</span>
          </a>
          <button
            type="button"
            onClick={onBackToTop}
            className="px-4 min-h-[44px] rounded-full glass-card inline-flex items-center gap-1.5 text-sm font-medium text-[#1A1222] dark:text-[#F6F2F8] hover:border-[#E0447C]/60 transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-[#E0447C]" aria-hidden="true" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
