export function isGoogleDriveLink(value) {
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
