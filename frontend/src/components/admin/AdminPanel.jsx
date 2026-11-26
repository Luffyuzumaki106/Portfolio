import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Database,
  Download,
  Edit3,
  Inbox,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  deleteContactMessage,
  fetchAuthStatus,
  fetchContactMessages,
  logoutAdmin,
  updateAdminCredentials,
  updateContactMessageRead,
} from '../../api/client';
import { isGoogleDriveLink } from '../../utils/googleDrive';
import AdminAuthView from './AdminAuthView';
import BannerSelector from './BannerSelector';
import MessagesInbox from './MessagesInbox';

const CATEGORIES = ['3D Cartoon', 'Mythology', 'Story Series', 'Editing', 'Branding'];

const EMPTY_FORM = {
  id: '',
  title: '',
  category: '3D Cartoon',
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

export default function AdminPanel({
  data,
  loading,
  saving,
  apiError,
  clearApiError,
  onRefreshPortfolio,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onReorderProjects,
  onToggleFeatured,
  onSaveSiteMedia,
  onImportPortfolio,
  onExitAdmin,
}) {
  const [authState, setAuthState] = useState({
    ready: false,
    initialized: true,
    authenticated: false,
    user: null,
    error: '',
  });
  const [activeTab, setActiveTab] = useState('projects');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [driveLinkError, setDriveLinkError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [profilePhoto, setProfilePhoto] = useState(data.siteMedia?.profilePhoto || '');
  const [showreelUrl, setShowreelUrl] = useState(data.siteMedia?.showreelUrl || '');
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState(
    data.siteMedia?.featuredVideoUrl || ''
  );

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credentialError, setCredentialError] = useState('');

  const importInputRef = useRef(null);

  const handleSessionExpired = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      authenticated: false,
      user: null,
      error: 'Your admin session expired. Please log in again.',
    }));
  }, []);

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await fetchContactMessages();
      setMessages(res.messages || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      if (err.status === 401) {
        handleSessionExpired();
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [handleSessionExpired]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await fetchAuthStatus();
        if (cancelled) return;
        setAuthState({
          ready: true,
          initialized: Boolean(status.initialized),
          authenticated: Boolean(status.authenticated),
          user: status.user || null,
          error: '',
        });
        if (status.user?.username) {
          setNewUsername(status.user.username);
        }
      } catch (err) {
        if (cancelled) return;
        setAuthState({
          ready: true,
          initialized: true,
          authenticated: false,
          user: null,
          error: err.message || 'Could not reach backend authentication service.',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authState.authenticated) {
      loadMessages();
    }
  }, [authState.authenticated, loadMessages]);

  useEffect(() => {
    setProfilePhoto(data.siteMedia?.profilePhoto || '');
    setShowreelUrl(data.siteMedia?.showreelUrl || '');
    setFeaturedVideoUrl(data.siteMedia?.featuredVideoUrl || '');
  }, [data]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // Clear local UI state even if request fails
    }
    setAuthState((prev) => ({
      ...prev,
      authenticated: false,
      user: null,
      error: '',
    }));
  };

  const handleMutationOutcome = (outcome, successMessage) => {
    if (outcome.ok) {
      setFeedback(successMessage);
      return true;
    }
    if (outcome.status === 401) {
      handleSessionExpired();
    }
    return false;
  };

  const handleSubmitProject = async (e) => {
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

    const payload = {
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

    const outcome = editingId
      ? await onUpdateProject(editingId, payload)
      : await onCreateProject(payload);

    if (
      handleMutationOutcome(
        outcome,
        editingId ? 'Project updated in backend database.' : 'Project published to backend database.'
      )
    ) {
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
    setActiveTab('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const outcome = await onDeleteProject(id);
    if (handleMutationOutcome(outcome, 'Project deleted from backend database.')) {
      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= data.projects.length) return;
    const ordered = data.projects.map((p) => p.id);
    const [moved] = ordered.splice(index, 1);
    ordered.splice(target, 0, moved);
    const outcome = await onReorderProjects(ordered);
    handleMutationOutcome(outcome, 'Project display order saved.');
  };

  const handleToggleFeatured = async (id) => {
    const outcome = await onToggleFeatured(id);
    handleMutationOutcome(outcome, 'Featured status updated.');
  };

  const handleSaveSiteMedia = async (e) => {
    e.preventDefault();
    const outcome = await onSaveSiteMedia({
      profilePhoto: profilePhoto.trim(),
      showreelUrl: showreelUrl.trim(),
      featuredVideoUrl: featuredVideoUrl.trim(),
    });
    handleMutationOutcome(outcome, 'Site media settings saved to backend database.');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.json';
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('Exported projects.json backup from live database.');
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.projects)) {
          setFeedback('Invalid JSON format: missing "projects" array.');
          return;
        }
        const outcome = await onImportPortfolio({
          siteMedia: parsed.siteMedia || {
            profilePhoto: '',
            showreelUrl: '',
            featuredVideoUrl: '',
          },
          projects: parsed.projects,
        });
        handleMutationOutcome(outcome, 'Imported JSON backup into live backend database.');
      } catch {
        setFeedback('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setCredentialError('');
    try {
      const res = await updateAdminCredentials({
        currentPassword,
        username: newUsername,
        newPassword,
      });
      setAuthState((prev) => ({ ...prev, user: res.user }));
      setCurrentPassword('');
      setNewPassword('');
      setFeedback('Server admin credentials updated successfully.');
    } catch (err) {
      if (err.status === 401 && err.message?.toLowerCase().includes('authentication')) {
        handleSessionExpired();
        return;
      }
      setCredentialError(err.message || 'Could not update credentials.');
    }
  };

  const handleToggleMessageRead = async (id, isRead) => {
    try {
      const res = await updateContactMessageRead(id, isRead);
      setMessages((prev) => {
        const next = prev.map((m) => (m.id === id ? res.message : m));
        setUnreadCount(next.filter((m) => !m.isRead).length);
        return next;
      });
    } catch (err) {
      if (err.status === 401) handleSessionExpired();
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await deleteContactMessage(id);
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== id);
        setUnreadCount(next.filter((m) => !m.isRead).length);
        return next;
      });
    } catch (err) {
      if (err.status === 401) handleSessionExpired();
    }
  };

  if (!authState.ready) {
    return (
      <div
        className="min-h-screen bg-[#0B0710] text-[#B8AEBF] flex items-center justify-center font-mono text-sm"
        aria-label="Loading admin session"
      >
        Checking backend admin session...
      </div>
    );
  }

  if (!authState.authenticated) {
    return (
      <AdminAuthView
        initialized={authState.initialized}
        initialError={authState.error}
        onExitAdmin={onExitAdmin}
        onAuthenticated={(user) => {
          setAuthState({
            ready: true,
            initialized: true,
            authenticated: true,
            user,
            error: '',
          });
          setNewUsername(user?.username || '');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitAdmin}
            className="px-4 min-h-[44px] rounded-full glass-card inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Preview Portfolio</span>
          </button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              Portfolio Admin
            </h1>
            <p className="font-mono text-xs text-[#544960] dark:text-[#B8AEBF]">
              Signed in as <span className="text-[#E0447C]">{authState.user?.username}</span> &bull; Backend Connected
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefreshPortfolio}
            disabled={loading}
            className="px-4 min-h-[44px] rounded-full glass-card text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

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
            disabled={saving}
            className="px-4 min-h-[44px] rounded-full glass-card text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 min-h-[44px] rounded-full border border-red-500/40 text-red-500 text-sm font-medium inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Architecture Banner */}
      <div className="glass-card rounded-2xl p-5 mb-6 border-l-4 border-l-[#E0447C]">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-[#E0447C] shrink-0 mt-0.5" />
          <div className="text-sm text-[#4A3F55] dark:text-[#B8AEBF] space-y-1">
            <p className="font-semibold text-[#1A1222] dark:text-[#F6F2F8]">
              Two-Tier Live Publishing Active (Frontend + Backend API)
            </p>
            <p>
              All projects, site media, uploaded images, and contact messages are stored in the
              backend SQLite database and take effect immediately for all visitors. Drive links
              render as logo-only work cards; set each Drive item&apos;s sharing to{' '}
              <strong>Anyone with the link - Viewer</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback / Error Bar */}
      {(apiError || feedback) && (
        <div className="mb-6 space-y-2">
          {apiError && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs sm:text-sm text-red-400 flex items-center justify-between gap-2">
              <span>{apiError}</span>
              <button type="button" onClick={clearApiError} className="underline">
                Dismiss
              </button>
            </div>
          )}
          {feedback && (
            <p className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs sm:text-sm text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </p>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Admin sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'projects'}
          onClick={() => setActiveTab('projects')}
          className={`px-4 min-h-[44px] rounded-full text-sm font-medium inline-flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white'
              : 'glass-card text-[#4A3F55] dark:text-[#B8AEBF]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Projects &amp; Media</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'messages'}
          onClick={() => setActiveTab('messages')}
          className={`px-4 min-h-[44px] rounded-full text-sm font-medium inline-flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white'
              : 'glass-card text-[#4A3F55] dark:text-[#B8AEBF]'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Messages Inbox</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#F5B85B] text-[#0B0710] font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'account'}
          onClick={() => setActiveTab('account')}
          className={`px-4 min-h-[44px] rounded-full text-sm font-medium inline-flex items-center gap-2 ${
            activeTab === 'account'
              ? 'bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white'
              : 'glass-card text-[#4A3F55] dark:text-[#B8AEBF]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Account Security</span>
        </button>
      </div>

      {activeTab === 'messages' ? (
        <MessagesInbox
          messages={messages}
          loading={messagesLoading}
          onRefresh={loadMessages}
          onToggleRead={handleToggleMessageRead}
          onDelete={handleDeleteMessage}
        />
      ) : activeTab === 'account' ? (
        <form
          onSubmit={handleUpdateCredentials}
          className="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl space-y-5"
        >
          <div>
            <h2 className="font-display text-xl font-bold">Update Server Admin Credentials</h2>
            <p className="mt-1 text-sm text-[#544960] dark:text-[#B8AEBF]">
              Credentials are salted and hashed with scrypt on the backend server. Updating them
              rotates your active session cookie.
            </p>
          </div>

          <label className="block font-mono text-xs uppercase">
            Current Password *
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm normal-case"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block font-mono text-xs uppercase">
              New Username *
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                autoComplete="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm normal-case"
              />
            </label>
            <label className="block font-mono text-xs uppercase">
              New Password (min 6 chars) *
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-white/80 dark:bg-[#0B0710] border border-black/10 dark:border-white/15 text-sm normal-case"
              />
            </label>
          </div>

          {credentialError && <p className="text-xs text-red-500">{credentialError}</p>}

          <button
            type="submit"
            className="px-6 min-h-[44px] rounded-full bg-[#F5B85B] text-[#0B0710] font-semibold text-sm"
          >
            Update Admin Credentials
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Add/Edit Project & Site Media */}
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
                onAuthExpired={handleSessionExpired}
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
                  disabled={saving}
                  className="px-6 min-h-[44px] rounded-full bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingId ? 'Update Project' : 'Publish Project'}</span>
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
                onAuthExpired={handleSessionExpired}
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
                  Featured Achievement YouTube Link (&ldquo;Aha Tamatar Bade Maze Daar&rdquo;)
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
                disabled={saving}
                className="px-6 min-h-[44px] rounded-full bg-[#F5B85B] text-[#0B0710] font-semibold text-sm disabled:opacity-60"
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
                      disabled={index === 0 || saving}
                      aria-label="Move up"
                      className="w-10 h-10 rounded-xl glass-card flex items-center justify-center disabled:opacity-35"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === data.projects.length - 1 || saving}
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
                      disabled={saving}
                      className="px-3 min-h-[40px] rounded-xl border border-red-500/30 text-red-500 text-xs font-medium inline-flex items-center gap-1.5 ml-auto disabled:opacity-60"
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
      )}
    </div>
  );
}
