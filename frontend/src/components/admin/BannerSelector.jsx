import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Link as LinkIcon, Upload } from 'lucide-react';
import { resolveMediaUrl, uploadImage } from '../../api/client';
import { prepareImageForUpload } from '../../utils/imageProcessor';

export default function BannerSelector({
  value,
  onChange,
  label = 'Banner Image',
  onAuthExpired,
}) {
  const [tab, setTab] = useState('link');
  const [urlError, setUrlError] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    setUploading(true);
    try {
      const prepared = await prepareImageForUpload(file);
      const uploaded = await uploadImage(prepared.file);
      onChange(uploaded.url);
      setUploadMeta(
        `Uploaded to server (${prepared.format}, ${prepared.sizeKb} KB)`
      );
    } catch (err) {
      if (err.status === 401) {
        onAuthExpired?.();
      }
      setUploadError(err.message || 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const previewSrc = resolveMediaUrl(value);

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
            <span>Upload to Server</span>
          </button>
        </div>
      </div>

      {tab === 'link' ? (
        <div>
          <input
            type="text"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => {
              setUrlError(false);
              onChange(e.target.value);
            }}
            placeholder="https://example.com/banner.webp or /uploads/..."
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
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <ImageIcon className="w-7 h-7 text-[#E0447C] mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-[#4A3F55] dark:text-[#B8AEBF]">
            Drag &amp; drop JPG, PNG, or WebP (auto-optimized &amp; stored on backend server)
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 px-4 min-h-[44px] rounded-full glass-card text-xs font-semibold hover:border-[#E0447C]/60 disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Browse Image'}
          </button>
          {uploadMeta && <p className="mt-2 text-xs text-emerald-500">{uploadMeta}</p>}
          {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
        </div>
      )}

      {previewSrc && (
        <div className="relative rounded-xl overflow-hidden border border-black/10 dark:border-white/15 bg-black/20">
          <img
            src={previewSrc}
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
