const MAX_WIDTH = 1600;
const TARGET_MAX_BYTES = 450 * 1024;
const MAX_DIRECT_FALLBACK_BYTES = 5 * 1024 * 1024;

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

function supportsWebpEncoding() {
  try {
    const c = document.createElement('canvas');
    c.width = 2;
    c.height = 2;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Resizes and compresses an uploaded image (JPG, PNG, WebP) on the client before
 * sending it to the backend upload endpoint, falling back to the raw file if needed.
 */
export function prepareImageForUpload(file) {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Please upload a JPG, PNG, or WebP image.'));
      return;
    }

    if (file.size <= TARGET_MAX_BYTES) {
      resolve({
        file,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        format: file.type.split('/')[1].toUpperCase(),
      });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = async () => {
        try {
          const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
          const targetW = Math.round(img.width * scale);
          const targetH = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            if (file.size <= MAX_DIRECT_FALLBACK_BYTES) {
              resolve({
                file,
                sizeKb: Math.max(1, Math.round(file.size / 1024)),
                format: file.type.split('/')[1].toUpperCase(),
              });
              return;
            }
            reject(new Error('Canvas context unavailable in this browser.'));
            return;
          }

          ctx.drawImage(img, 0, 0, targetW, targetH);

          const mimeType = supportsWebpEncoding() ? 'image/webp' : 'image/jpeg';
          const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
          let quality = 0.86;
          let blob = await canvasToBlob(canvas, mimeType, quality);

          while (blob && blob.size > TARGET_MAX_BYTES && quality > 0.4) {
            quality = Number((quality - 0.1).toFixed(2));
            blob = await canvasToBlob(canvas, mimeType, quality);
          }

          if (!blob) {
            if (file.size <= MAX_DIRECT_FALLBACK_BYTES) {
              resolve({
                file,
                sizeKb: Math.max(1, Math.round(file.size / 1024)),
                format: file.type.split('/')[1].toUpperCase(),
              });
              return;
            }
            reject(new Error('Could not optimize image for upload.'));
            return;
          }

          const baseName = file.name.replace(/\.[^.]+$/, '') || 'upload';
          const optimizedFile = new File([blob], `${baseName}.${ext}`, { type: mimeType });
          resolve({
            file: optimizedFile,
            sizeKb: Math.max(1, Math.round(optimizedFile.size / 1024)),
            format: mimeType === 'image/webp' ? 'WebP' : 'JPEG',
            width: canvas.width,
            height: canvas.height,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
