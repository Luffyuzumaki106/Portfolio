import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import SectionHeading from './SectionHeading';

export default function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="08 // CONTACT"
          title="Let's Create Together"
          subtitle="Currently with SQB, and available for freelance and remote projects."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="mailto:faizsmart13683@gmail.com"
              className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-[#E0447C]/50 transition-colors min-h-[44px]"
            >
              <div className="w-11 h-11 rounded-xl bg-[#E0447C]/15 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#E0447C]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="block font-mono text-xs text-[#544960] dark:text-[#B8AEBF]">
                  Email
                </span>
                <span className="font-medium text-sm sm:text-base text-[#1A1222] dark:text-[#F6F2F8] break-all">
                  faizsmart13683@gmail.com
                </span>
              </div>
            </a>

            <a
              href="tel:+917827602563"
              className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-[#E0447C]/50 transition-colors min-h-[44px]"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F5B85B]/15 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#F5B85B]" aria-hidden="true" />
              </div>
              <div>
                <span className="block font-mono text-xs text-[#544960] dark:text-[#B8AEBF]">
                  Phone
                </span>
                <span className="font-medium text-sm sm:text-base text-[#1A1222] dark:text-[#F6F2F8]">
                  +91 7827602563
                </span>
              </div>
            </a>

            <a
              href="https://wa.me/917827602563"
              target="_blank"
              rel="noreferrer"
              className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#E0447C]/50 transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                </div>
                <div>
                  <span className="block font-mono text-xs text-[#544960] dark:text-[#B8AEBF]">
                    WhatsApp
                  </span>
                  <span className="font-medium text-sm sm:text-base text-[#1A1222] dark:text-[#F6F2F8]">
                    Chat on WhatsApp
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#B8AEBF]" aria-hidden="true" />
            </a>

            <a
              href="https://behance.net/gallery/256917401/AI-Editing"
              target="_blank"
              rel="noreferrer"
              className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#E0447C]/50 transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#7A1248]/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-extrabold text-sm text-[#E0447C]">Bē</span>
                </div>
                <div>
                  <span className="block font-mono text-xs text-[#544960] dark:text-[#B8AEBF]">
                    Behance Portfolio
                  </span>
                  <span className="font-medium text-sm sm:text-base text-[#1A1222] dark:text-[#F6F2F8]">
                    AI-Editing Gallery
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#B8AEBF]" aria-hidden="true" />
            </a>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#E0447C]" aria-hidden="true" />
              </div>
              <div>
                <span className="block font-mono text-xs text-[#544960] dark:text-[#B8AEBF]">
                  Location
                </span>
                <span className="font-medium text-sm sm:text-base text-[#1A1222] dark:text-[#F6F2F8]">
                  Delhi, India
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
