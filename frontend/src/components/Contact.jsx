import { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import SectionHeading from './SectionHeading';
import { submitContactMessage } from '../api/client';

const PROJECT_TYPES = [
  '3D Cartoon Rhymes',
  'Mythology / Storytelling',
  'Realistic AI Video',
  'Video Editing & VFX',
  'Branding Visuals',
  'Other',
];

const INITIAL_FORM = {
  name: '',
  email: '',
  projectType: PROJECT_TYPES[0],
  message: '',
};

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentMessage, setSentMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSentMessage('');
    setSubmitting(true);
    try {
      const res = await submitContactMessage(form);
      setSentMessage(res?.message || 'Message sent successfully!');
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.message || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          timecode="08 // CONTACT"
          title="Let's Create Together"
          subtitle="Currently with SQB, and available for freelance and remote projects."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct Channels */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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

          {/* Inquiry Form backed by REST API */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#F5B85B]">
                Direct Brief
              </span>
              <h3 className="font-display text-2xl font-bold text-[#1A1222] dark:text-[#F6F2F8] mt-1">
                Send a Project Inquiry
              </h3>
              <p className="text-sm text-[#544960] dark:text-[#B8AEBF] mt-1">
                Share your script, style reference, or timeline and I&apos;ll get back to you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5 text-[#544960] dark:text-[#B8AEBF]">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Aarav Mehta"
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase mb-1.5 text-[#544960] dark:text-[#B8AEBF]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  maxLength={160}
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@studio.com"
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase mb-1.5 text-[#544960] dark:text-[#B8AEBF]">
                Project Type
              </label>
              <select
                value={form.projectType}
                onChange={(e) => setForm((prev) => ({ ...prev, projectType: e.target.value }))}
                className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase mb-1.5 text-[#544960] dark:text-[#B8AEBF]">
                Project Details *
              </label>
              <textarea
                rows={5}
                required
                minLength={10}
                maxLength={3000}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Tell me about the video duration, style, references, or target delivery date..."
                className="w-full p-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
              />
            </div>

            {error && (
              <p className="text-xs sm:text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            {sentMessage && (
              <div
                className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs sm:text-sm text-emerald-500 flex items-center gap-2"
                role="status"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{sentMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 min-h-[46px] rounded-full bg-gradient-to-r from-[#7A1248] via-[#E0447C] to-[#E0447C] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-[#E0447C]/25 hover:opacity-95 disabled:opacity-60 transition-opacity"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
