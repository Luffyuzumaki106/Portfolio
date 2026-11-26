/**
 * Parses YouTube, Vimeo, Google Drive, or direct MP4 links into a safe embed descriptor.
 */
export function parseVideoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube (watch, youtu.be, shorts, embed)
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'iframe',
      provider: 'YouTube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      thumbnailUrl: `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      provider: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      thumbnailUrl: null,
    };
  }

  // Google Drive
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'iframe',
      provider: 'Google Drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      thumbnailUrl: null,
    };
  }

  // Direct MP4 / WebM / MOV
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(trimmed)) {
    return {
      type: 'video',
      provider: 'Direct Video',
      embedUrl: trimmed,
      thumbnailUrl: null,
    };
  }

  return {
    type: 'external',
    provider: 'External Link',
    embedUrl: trimmed,
    thumbnailUrl: null,
  };
}
