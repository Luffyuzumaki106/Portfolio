const ALLOWED_CATEGORIES = new Set([
  '3D Cartoon',
  'Mythology',
  'Story Series',
  'Editing',
  'Branding',
]);

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #7A1248 0%, #E0447C 55%, #F5B85B 100%)';

export function isGoogleDriveLink(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      ['drive.google.com', 'docs.google.com'].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function isSafeUrl(value, { allowRelativeUploads = false, allowDataImage = false } = {}) {
  if (!value) return true;
  if (allowRelativeUploads && value.startsWith('/uploads/')) {
    return !value.includes('..');
  }
  if (allowDataImage && /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(value)) {
    return true;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeProjectInput(body, fallbackId = null) {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object.' };
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return { error: 'Project title is required.' };
  }
  if (title.length > 160) {
    return { error: 'Project title must be 160 characters or fewer.' };
  }

  const categoryRaw = typeof body.category === 'string' ? body.category.trim() : '3D Cartoon';
  const category = ALLOWED_CATEGORIES.has(categoryRaw) ? categoryRaw : '3D Cartoon';

  const shortDescription =
    typeof body.shortDescription === 'string' ? body.shortDescription.trim().slice(0, 2000) : '';
  const role = typeof body.role === 'string' ? body.role.trim().slice(0, 120) : '';
  const client = typeof body.client === 'string' ? body.client.trim().slice(0, 120) : '';
  const date = typeof body.date === 'string' ? body.date.trim().slice(0, 40) : '';

  let toolsUsed = [];
  if (Array.isArray(body.toolsUsed)) {
    toolsUsed = body.toolsUsed
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 30);
  } else if (typeof body.toolsUsedText === 'string') {
    toolsUsed = body.toolsUsedText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 30);
  }

  const videoLink = typeof body.videoLink === 'string' ? body.videoLink.trim() : '';
  const driveLink = typeof body.driveLink === 'string' ? body.driveLink.trim() : '';
  const externalLink = typeof body.externalLink === 'string' ? body.externalLink.trim() : '';
  const bannerImage = typeof body.bannerImage === 'string' ? body.bannerImage.trim() : '';
  const bannerGradient =
    typeof body.bannerGradient === 'string' && body.bannerGradient.trim()
      ? body.bannerGradient.trim().slice(0, 240)
      : DEFAULT_GRADIENT;

  if (videoLink && !isSafeUrl(videoLink)) {
    return { error: 'Video link must be a valid HTTP or HTTPS URL.' };
  }
  if (driveLink && !isGoogleDriveLink(driveLink)) {
    return { error: 'Drive link must be a valid HTTPS Google Drive or Google Docs URL.' };
  }
  if (externalLink && !isSafeUrl(externalLink)) {
    return { error: 'External link must be a valid HTTP or HTTPS URL.' };
  }
  if (bannerImage && !isSafeUrl(bannerImage, { allowRelativeUploads: true, allowDataImage: true })) {
    return { error: 'Banner image must be an uploaded media path, data image, or HTTP(S) URL.' };
  }

  const rawId = typeof body.id === 'string' ? body.id.trim() : '';
  const safeId = rawId
    ? rawId.replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 80)
    : fallbackId || `proj-${Date.now()}`;

  return {
    data: {
      id: safeId || `proj-${Date.now()}`,
      title,
      category,
      shortDescription,
      role,
      client,
      toolsUsed,
      date,
      videoLink,
      driveLink,
      externalLink,
      bannerImage,
      bannerGradient,
      featured: Boolean(body.featured),
    },
  };
}

export function sanitizeSiteMediaInput(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Site media payload must be a JSON object.' };
  }

  const profilePhoto = typeof body.profilePhoto === 'string' ? body.profilePhoto.trim() : '';
  const showreelUrl = typeof body.showreelUrl === 'string' ? body.showreelUrl.trim() : '';
  const featuredVideoUrl =
    typeof body.featuredVideoUrl === 'string' ? body.featuredVideoUrl.trim() : '';

  if (
    profilePhoto &&
    !isSafeUrl(profilePhoto, { allowRelativeUploads: true, allowDataImage: true })
  ) {
    return { error: 'Profile photo must be an uploaded media path, data image, or HTTP(S) URL.' };
  }
  if (showreelUrl && !isSafeUrl(showreelUrl)) {
    return { error: 'Showreel URL must be a valid HTTP or HTTPS URL.' };
  }
  if (featuredVideoUrl && !isSafeUrl(featuredVideoUrl)) {
    return { error: 'Featured achievement video URL must be a valid HTTP or HTTPS URL.' };
  }

  return {
    data: {
      profilePhoto,
      showreelUrl,
      featuredVideoUrl,
    },
  };
}

export function sanitizeContactInput(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Contact payload must be a JSON object.' };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const projectType = typeof body.projectType === 'string' ? body.projectType.trim().slice(0, 120) : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name.length < 2 || name.length > 100) {
    return { error: 'Please enter your name (2 to 100 characters).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { error: 'Please enter a valid email address.' };
  }
  if (message.length < 10 || message.length > 3000) {
    return { error: 'Please enter a message (10 to 3000 characters).' };
  }

  return {
    data: {
      name,
      email,
      projectType,
      message,
    },
  };
}
