import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Download,
  Edit3,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Lock,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { processBannerImageFile } from '../../utils/imageProcessor';
import { getLocalStorageUsage } from '../../utils/storage';
import {
  ADMIN_CREDENTIALS_KEY,
  ADMIN_SESSION_KEY,
  ADMIN_USERNAME,
  createAdminCredentials,
  verifyAdminPassword,
} from '../../utils/adminAuth';
import { isGoogleDriveLink } from '../../utils/googleDrive';

const CATEGORIES = [
  'Happy Tots',
  'Pocket FM',
  'UGC Ads',
  'Other Projects',
  '3D Cartoon',
  'Mythology',
  'Story Series',
  'Editing',
  'Branding',
];

const EMPTY_FORM = {
  id: '',
  title: '',
  category: 'Happy Tots',
  shortDescription: '',
  role: '',
  client: '',
  toolsUsedText: '',
  date: '2026',
  videoLink: '',
  driveLink: '',
  externalLink: '',
  bannerImage: '',
  bannerGradient: 'linear-gradient(135deg, #7A1248 0%, #E0447C 55%, #F5B85B 100%)',
  featured: false,
};

function BannerSelector({ value, onChange, label = 'Banner Image' }) {
  const [tab, setTab] = useState('link');
  const [urlError, setUrlError] = useState(false);
  const [uploadMeta, setUploadMeta] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUrlError(false);
  }, [value]);

  const handleFile = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploadMeta('');
    try {
      const result = await processBannerImageFile(file);
      onChange(result.dataUrl);
      setUploadMeta(
        `Compressed to ${result.format} (${result.width}×${result.height}px, ${result.sizeKb} KB)`
      );
    } catch (err) {
      setUploadError(err.message || 'Could not process image.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase text-[#544960] dark:text-[#B8AEBF]">
          {label}
        </span>
        <div className="inline-flex rounded-xl bg-black/5 dark:bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setTab('link')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px] ${
              tab === 'link'
                ? 'bg-[#E0447C] text-white'
                : 'text-[#544960] dark:text-[#B8AEBF]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image Link</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px] ${
              tab === 'upload'
                ? 'bg-[#E0447C] text-white'
                : 'text-[#544960] dark:text-[#B8AEBF]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {tab === 'link' ? (
        <div>
          <input
            type="url"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => {
              setUrlError(false);
              onChange(e.target.value);
            }}
            placeholder="https://example.com/banner.webp"
            className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
          />
          {urlError && (
            <p className="mt-1.5 text-xs text-red-500">
              Could not load image from this URL. Check that the URL is public and direct.
            </p>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
            dragActive
              ? 'border-[#E0447C] bg-[#E0447C]/10'
              : 'border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <ImageIcon className="w-7 h-7 text-[#E0447C] mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-[#4A3F55] dark:text-[#B8AEBF]">
            Drag &amp; drop JPG, PNG, or WebP (auto-resized to max 1280px, under ~200KB)
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 px-4 min-h-[44px] rounded-full glass-card text-xs font-semibold hover:border-[#E0447C]/60"
          >
            Browse Image
          </button>
          {uploadMeta && <p className="mt-2 text-xs text-emerald-500">{uploadMeta}</p>}
          {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
        </div>
      )}

      {value && (
        <div className="relative rounded-xl overflow-hidden border border-black/10 dark:border-white/15 bg-black/20">
          <img
            src={value}
            alt="Preview"
            className="w-full max-h-44 object-cover"
            onError={() => setUrlError(true)}
            onLoad={() => setUrlError(false)}
          />
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUploadMeta('');
              setUrlError(false);
            }}
            className="absolute top-2 right-2 px-3 py-1 rounded-full bg-black/75 text-white text-xs hover:bg-red-600"
          >
            Clear Image
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({
  data,
  hasDraft,
  storageError,
  clearStorageError,
  updateDraft,
  discardDraft,
  onExitAdmin,
}) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [credentials, setCredentials] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [usernameInput, setUsernameInput] = useState(ADMIN_USERNAME);
  const [newUsername, setNewUsername] = useState(ADMIN_USERNAME);
  const [newPassword, setNewPassword] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [credentialUpdateError, setCredentialUpdateError] = useState('');
  const [driveLinkError, setDriveLinkError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState('');
  const [usage, setUsage] = useState(() => getLocalStorageUsage());

  const [profilePhoto, setProfilePhoto] = useState(data.siteMedia?.profilePhoto || '');
  const [showreelUrl, setShowreelUrl] = useState(data.siteMedia?.showreelUrl || '');
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState(
    data.siteMedia?.featuredVideoUrl || ''
  );
  const [authError, setAuthError] = useState('');

  const importInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed?.username === 'string' &&
          parsed.username.trim() &&
          typeof parsed.salt === 'string' &&
          typeof parsed.passwordHash === 'string'
        ) {
          setCredentials(parsed);
          setUsernameInput(parsed.username);
          setNewUsername(parsed.username);
        } else {
          setAuthError("Saved admin login is invalid. Clear this site's admin credentials to set it up again.");
        }
      }
    } catch {
      setAuthError('Could not access browser storage. Check your browser settings and try again.');
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    setProfilePhoto(data.siteMedia?.profilePhoto || '');
    setShowreelUrl(data.siteMedia?.showreelUrl || '');
    setFeaturedVideoUrl(data.siteMedia?.featuredVideoUrl || '');
    setUsage(getLocalStorageUsage());
  }, [data]);

  const handleSetupAdmin = async () => {
    setAuthError('');
    try {
      const nextCredentials = await createAdminCredentials(usernameInput, passcodeInput);
      window.localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(nextCredentials));
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
      setCredentials(nextCredentials);
      setNewUsername(nextCredentials.username);
      setPasscodeInput('');
      setUnlocked(true);
    } catch {
      setAuthError('Could not save your admin login. Check browser storage and try again.');
    }
  };

  const handleResetAdminLogin = () => {
    try {
      window.localStorage.removeItem(ADMIN_CREDENTIALS_KEY);
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
      setCredentials(null);
      setUsernameInput(ADMIN_USERNAME);
      setPasscodeInput('');
      setPasscodeError('');
      setAuthError('Enter your preferred username and password to set up this browser.');
    } catch {
      setAuthError('Could not reset the saved login. Check your browser storage settings.');
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setPasscodeError('');
    try {
      const valid =
        usernameInput.trim().toLowerCase() === credentials.username.trim().toLowerCase() &&
        await verifyAdminPassword(credentials, passcodeInput);
      if (valid) {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        setUnlocked(true);
      } else {
        setPasscodeError('Incorrect username or password.');
      }
    } catch {
      setPasscodeError('Could not verify the password. Please try again in a modern browser.');
    }
  };

  const handleUpdateAdminCredentials = async (e) => {
    e.preventDefault();
    setCredentialUpdateError('');
    try {
      const nextCredentials = await createAdminCredentials(newUsername, newPassword);
      window.localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(nextCredentials));
      setCredentials(nextCredentials);
      setUsernameInput(nextCredentials.username);
      setPasscodeInput('');
      setNewPassword('');
      notify('Admin login credentials updated in this browser.');
    } catch {
      setCredentialUpdateError('Could not save the admin login. Check browser storage and try again.');
    }
  };

  const handleSubmitProject = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.driveLink.trim() && !isGoogleDriveLink(form.driveLink.trim())) {
      setDriveLinkError('Enter an HTTPS Google Drive or Google Docs sharing link.');
      return;
    }
    setDriveLinkError('');

    const toolsUsed = form.toolsUsedText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectPayload = {
      id: editingId || `proj-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      shortDescription: form.shortDescription.trim(),
      role: form.role.trim(),
      client: form.client.trim(),
      toolsUsed,
      date: form.date.trim(),
      videoLink: form.videoLink.trim(),
      driveLink: form.driveLink.trim(),
      externalLink: form.externalLink.trim(),
      bannerImage: form.bannerImage.trim(),
      bannerGradient: form.bannerGradient,
      featured: Boolean(form.featured),
    };

    const ok = updateDraft((prev) => {
      const list = [...prev.projects];
      if (editingId) {
        const idx = list.findIndex((p) => p.id === editingId);
        if (idx !== -1) list[idx] = projectPayload;
      } else {
        list.unshift(projectPayload);
      }
      return { ...prev, projects: list };
    });

    if (ok) {
      notify(editingId ? 'Project updated in local draft.' : 'Project added to local draft.');
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  };

  const startEdit = (project) => {
    setEditingId(project.id);
    setForm({
      ...EMPTY_FORM,
      ...project,
      toolsUsedText: (project.toolsUsed || []).join(', '),
    });
    setDriveLinkError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const ok = updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
    if (ok) {
      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
      notify('Project deleted from local draft.');
    }
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= data.projects.length) return;
    const ok = updateDraft((prev) => {
      const list = [...prev.projects];
      const [item] = list.splice(index, 1);
      list.splice(target, 0, item);
      return { ...prev, projects: list };
    });
    if (ok) notify('Project order updated.');
  };

  const handleToggleFeatured = (id) => {
    const ok = updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, featured: !p.featured } : p
      ),
    }));
    if (ok) notify('Featured status updated.');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.json';
    a.click();
    URL.revokeObjectURL(url);
    notify('Exported projects.json backup.');
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.projects)) {
          notify('Invalid JSON format: missing "projects" array.');
          return;
        }
        const ok = updateDraft({
          siteMedia: parsed.siteMedia || {
            profilePhoto: '',
            showreelUrl: '',
            featuredVideoUrl: '',
          },
          projects: parsed.projects,
        });
        if (ok) notify('Imported JSON into local draft.');
      } catch {
        notify('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const notify = (msg) => {
    setFeedback(msg);
    setUsage(getLocalStorageUsage());
  };

  const handleSaveSiteMedia = (e) => {
    e.preventDefault();
    const ok = updateDraft((prev) => ({
      ...prev,
      siteMedia: {
        profilePhoto: profilePhoto.trim(),
        showreelUrl: showreelUrl.trim(),
        featuredVideoUrl: featuredVideoUrl.trim(),
      },
    }));
    if (ok) notify('Site media settings saved to local draft.');
  };

  if (!authReady) {
    return <div className="min-h-screen bg-[#0B0710]" aria-label="Loading admin login" />;
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0710] text-[#F6F2F8]">
        <form
          onSubmit={
            credentials
              ? handleUnlock
              : (e) => {
                  e.preventDefault();
                  handleSetupAdmin();
                }
          }
          className="w-full max-w-md glass-card rounded-3xl p-8 space-y-5 border border-white/10"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E0447C]/15 border border-[#E0447C]/40 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#E0447C]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">
              {credentials ? 'Portfolio Admin Login' : 'Set Up Admin Login'}
            </h1>
            <p className="text-sm text-[#B8AEBF] mt-1">
              Enter your chosen credentials once on this browser. The password is stored as a hash;
              this client-side login is not server-side security.
            </p>
          </div>
          <label className="block text-xs text-[#B8AEBF]">
            Username
            <input
              type="text"
              required
              autoComplete="username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-black/50 border border-white/15 text-white"
              autoFocus
            />
          </label>
          <label className="block text-xs text-[#B8AEBF]">
            {credentials ? 'Password' : 'Choose Password'}
            <input
              type="password"
              required
              autoComplete={credentials ? 'current-password' : 'new-password'}
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-black/50 border border-white/15 text-white"
            />
          </label>
          {authError && <p className="text-xs text-red-400">{authError}</p>}
          {passcodeError && <p className="text-xs text-red-400">{passcodeError}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-4 min-h-[44px] rounded-full border border-white/15 text-sm text-[#B8AEBF] hover:text-white"
            >
              Back to Site
            </button>
            {credentials ? (
              <>
                <button
                  type="button"
                  onClick={handleResetAdminLogin}
                  className="text-xs text-[#B8AEBF] underline"
                >
                  Reset this browser's login
                </button>
                <button
                  type="submit"
                  className="px-6 min-h-[44px] rounded-full bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white font-semibold text-sm"
                >
                  Log In
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="px-6 min-h-[44px] rounded-full bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white font-semibold text-sm"
              >
                Save Login &amp; Continue
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitAdmin}
            className="px-4 min-h-[44px] rounded-full glass-card inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Preview Portfolio</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            Project Manager
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="px-4 min-h-[44px] rounded-full bg-[#F5B85B] text-[#0B0710] font-semibold text-sm inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportJson}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="px-4 min-h-[44px] rounded-full glass-card text-sm font-medium inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>

          {hasDraft && (
            <button
              type="button"
              onClick={() => {
                discardDraft();
                notify('Local draft discarded. Now showing src/data/projects.json.');
              }}
              className="px-4 min-h-[44px] rounded-full border border-red-500/40 text-red-500 text-sm font-medium inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Discard Draft</span>
            </button>
          )}
        </div>
      </div>

      {/* Publishing Explanation */}
      <div className="glass-card rounded-2xl p-5 mb-6 border-l-4 border-l-[#F5B85B]">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#F5B85B] shrink-0 mt-0.5" />
          <div className="text-sm text-[#4A3F55] dark:text-[#B8AEBF] space-y-1">
            <p className="font-semibold text-[#1A1222] dark:text-[#F6F2F8]">
              How Publishing Works (No Backend)
            </p>
            <p>
              Public visitors always see <code className="text-[#E0447C]">src/data/projects.json</code>.
              Edits you make here are saved only in <strong>this browser&apos;s localStorage</strong> as
              a local draft for live preview. To publish your changes globally, click{' '}
              <strong>Export JSON</strong>, replace <code className="text-[#E0447C]">src/data/projects.json</code>{' '}
              with the downloaded file, and redeploy. Drive links appear in the preview without a banner.
              Set each Drive item's sharing to <strong>Anyone with the link - Viewer</strong> if you want
              visitors to access it. Videos must be links only (do not upload video files).
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleUpdateAdminCredentials}
        className="glass-card rounded-2xl p-5 mb-6 space-y-4"
      >
        <div>
          <h2 className="font-display text-lg font-bold">Admin Login Credentials</h2>
          <p className="mt-1 text-sm text-[#544960] dark:text-[#B8AEBF]">
            Changes are saved in this browser only. This client-side login is for local preview
            convenience, not server-side security.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block font-mono text-xs uppercase">
            Username
            <input
              type="text"
              required
              autoComplete="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm normal-case"
            />
          </label>
          <label className="block font-mono text-xs uppercase">
            New Password
            <input
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm normal-case"
            />
          </label>
        </div>
        {credentialUpdateError && (
          <p className="text-xs text-red-500">{credentialUpdateError}</p>
        )}
        <button
          type="submit"
          className="px-5 min-h-[44px] rounded-full bg-[#F5B85B] text-[#0B0710] font-semibold text-sm"
        >
          Save Admin Login
        </button>
      </form>

      {/* Storage Usage & Alerts */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="font-mono text-xs uppercase text-[#544960] dark:text-[#B8AEBF]">
            localStorage Usage: {usage.kb} KB ({usage.mb} MB) / ~5.00 MB ({usage.percent}%)
          </span>
          <span className="font-mono text-xs text-[#F5B85B]">
            {hasDraft ? 'Local Draft Active' : 'Synced with projects.json'}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all ${
              usage.isCritical
                ? 'bg-red-500'
                : usage.isWarning
                  ? 'bg-[#F5B85B]'
                  : 'bg-gradient-to-r from-[#7A1248] to-[#E0447C]'
            }`}
            style={{ width: `${usage.percent}%` }}
          />
        </div>
        {usage.isWarning && (
          <p className="mt-2 text-xs text-amber-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Browser storage is nearly full. Prefer external image URLs over uploaded Base64 images.
            </span>
          </p>
        )}
        {storageError && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-400 flex items-center justify-between gap-2">
            <span>{storageError}</span>
            <button type="button" onClick={clearStorageError} className="underline">
              Dismiss
            </button>
          </div>
        )}
        {feedback && (
          <p className="mt-2 text-xs text-emerald-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Add/Edit Project Form */}
        <div className="lg:col-span-7 space-y-8">
          <form
            onSubmit={handleSubmitProject}
            className="glass-card rounded-3xl p-6 sm:p-7 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                  }}
                  className="text-xs text-[#E0447C] underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Project title"
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase mb-1.5">
                Short Description
              </label>
              <textarea
                rows={3}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Describe the project, style, and outcome..."
                className="w-full p-3 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. AI Artist"
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">Client</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="e.g. Pocket FM"
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">Date</label>
                <input
                  type="text"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="e.g. 2026"
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase mb-1.5">
                Tools Used (comma-separated)
              </label>
              <input
                type="text"
                value={form.toolsUsedText}
                onChange={(e) => setForm({ ...form, toolsUsedText: e.target.value })}
                placeholder="Seedance 2.5, Kling, After Effects"
                className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">
                  Video Link (YouTube, Vimeo, Drive, MP4)
                </label>
                <input
                  type="url"
                  value={form.videoLink}
                  onChange={(e) => setForm({ ...form, videoLink: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">
                  Google Drive Work Link
                </label>
                <input
                  type="url"
                  value={form.driveLink}
                  onChange={(e) => {
                    setForm({ ...form, driveLink: e.target.value });
                    setDriveLinkError('');
                  }}
                  placeholder="https://drive.google.com/drive/folders/..."
                  aria-invalid={Boolean(driveLinkError)}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
                {driveLinkError ? (
                  <p className="mt-1.5 text-xs text-red-500">{driveLinkError}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-[#544960] dark:text-[#B8AEBF]">
                    Add a Drive/Docs link to show this as a logo-only work card.
                  </p>
                )}
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1.5">
                  External Link
                </label>
                <input
                  type="url"
                  value={form.externalLink}
                  onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
                  placeholder="https://behance.net/..."
                  className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
                />
              </div>
            </div>

            <BannerSelector
              value={form.bannerImage}
              onChange={(val) => setForm({ ...form, bannerImage: val })}
              label="Banner Image"
            />

            <label className="inline-flex items-center gap-2.5 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-[#E0447C]"
              />
              <span className="text-sm font-medium">Mark as Featured Project</span>
            </label>

            <div>
              <button
                type="submit"
                className="px-6 min-h-[44px] rounded-full bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white font-semibold text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Update Project' : 'Add Project'}</span>
              </button>
            </div>
          </form>

          {/* Site Media Settings */}
          <form
            onSubmit={handleSaveSiteMedia}
            className="glass-card rounded-3xl p-6 sm:p-7 space-y-4"
          >
            <h2 className="font-display text-xl font-bold">Site Media Settings</h2>

            <BannerSelector
              value={profilePhoto}
              onChange={setProfilePhoto}
              label="Profile Photo"
            />

            <div>
              <label className="block font-mono text-xs uppercase mb-1.5">
                Hero Showreel Loop Video Link (Direct MP4/WebM)
              </label>
              <input
                type="url"
                value={showreelUrl}
                onChange={(e) => setShowreelUrl(e.target.value)}
                placeholder="https://example.com/showreel.mp4"
                className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase mb-1.5">
                Featured Achievement Video Link (&ldquo;Aha Tamatar Bade Maze Daar&rdquo;)
              </label>
              <input
                type="url"
                value={featuredVideoUrl}
                onChange={(e) => setFeaturedVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-6 min-h-[44px] rounded-full bg-[#F5B85B] text-[#0B0710] font-semibold text-sm"
            >
              Save Site Media
            </button>
          </form>
        </div>

        {/* Right Column: Project List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-xl font-bold">
            Projects ({data.projects.length})
          </h2>

          {data.projects.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-sm text-[#B8AEBF]">
              No projects yet. Add one using the form.
            </div>
          ) : (
            data.projects.map((project, index) => (
              <div
                key={project.id}
                className="glass-card rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] text-[#E0447C] uppercase">
                      {project.category}
                    </span>
                    <h3 className="font-display font-bold text-base">
                      {project.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(project.id)}
                    aria-label="Toggle featured"
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      project.featured
                        ? 'bg-[#F5B85B]/20 border-[#F5B85B] text-[#F5B85B]'
                        : 'border-white/10 text-[#B8AEBF]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="w-10 h-10 rounded-xl glass-card flex items-center justify-center disabled:opacity-35"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === data.projects.length - 1}
                    aria-label="Move down"
                    className="w-10 h-10 rounded-xl glass-card flex items-center justify-center disabled:opacity-35"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(project)}
                    className="px-3 min-h-[40px] rounded-xl glass-card text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    className="px-3 min-h-[40px] rounded-xl border border-red-500/30 text-red-500 text-xs font-medium inline-flex items-center gap-1.5 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
