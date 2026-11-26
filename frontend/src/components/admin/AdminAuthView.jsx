import { useState } from 'react';
import { Lock } from 'lucide-react';
import { loginAdmin, setupAdmin } from '../../api/client';

export default function AdminAuthView({
  initialized,
  initialError,
  onAuthenticated,
  onExitAdmin,
}) {
  const [username, setUsername] = useState('Faizmaster');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = initialized
        ? await loginAdmin({ username, password })
        : await setupAdmin({ username, password });
      setPassword('');
      onAuthenticated(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0710] text-[#F6F2F8]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md glass-card rounded-3xl p-8 space-y-5 border border-white/10"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#E0447C]/15 border border-[#E0447C]/40 flex items-center justify-center">
          <Lock className="w-6 h-6 text-[#E0447C]" />
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold">
            {initialized ? 'Portfolio Admin Login' : 'Create Server Admin Account'}
          </h1>
          <p className="text-sm text-[#B8AEBF] mt-1">
            {initialized
              ? 'Sign in with your backend admin credentials to publish live changes.'
              : 'Set up the primary admin account stored securely on the backend SQLite database.'}
          </p>
        </div>

        <label className="block text-xs text-[#B8AEBF]">
          Username
          <input
            type="text"
            required
            minLength={2}
            maxLength={50}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-black/50 border border-white/15 text-white"
            autoFocus
          />
        </label>

        <label className="block text-xs text-[#B8AEBF]">
          {initialized ? 'Password' : 'Choose Password (min 6 characters)'}
          <input
            type="password"
            required
            minLength={initialized ? 1 : 6}
            autoComplete={initialized ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full min-h-[44px] px-4 rounded-xl bg-black/50 border border-white/15 text-white"
          />
        </label>

        {error && (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExitAdmin}
            className="px-4 min-h-[44px] rounded-full border border-white/15 text-sm text-[#B8AEBF] hover:text-white"
          >
            Back to Site
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 min-h-[44px] rounded-full bg-gradient-to-r from-[#7A1248] to-[#E0447C] text-white font-semibold text-sm disabled:opacity-60"
          >
            {submitting
              ? 'Please wait...'
              : initialized
                ? 'Log In'
                : 'Create Account & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
