const MAX_WIDTH = 1280;
const TARGET_MAX_BYTES = 200 * 1024; // ~200 KB

function canvasToDataUrl(canvas, mimeType, quality) {
  return canvas.toDataURL(mimeType, quality);
}

function dataUrlByteSize(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
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
 * Resizes an uploaded image (JPG, PNG, WebP) to max 1280px wide and compresses
 * to WebP (or JPEG fallback) under ~200KB, returning a Base64 data URL.
 */
export function processBannerImageFile(file) {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Please upload a JPG, PNG, or WebP image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = () => {
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        const targetW = Math.round(img.width * scale);
        const targetH = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable in this browser.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const mimeType = supportsWebpEncoding() ? 'image/webp' : 'image/jpeg';
        let quality = 0.86;
        let result = canvasToDataUrl(canvas, mimeType, quality);

        while (dataUrlByteSize(result) > TARGET_MAX_BYTES && quality > 0.32) {
          quality = Number((quality - 0.1).toFixed(2));
          result = canvasToDataUrl(canvas, mimeType, quality);
        }

        // If still over 200KB at low quality, downscale dimensions further
        if (dataUrlByteSize(result) > TARGET_MAX_BYTES) {
          const smallerW = Math.round(targetW * 0.72);
          const smallerH = Math.round(targetH * 0.72);
          canvas.width = smallerW;
          canvas.height = smallerH;
          ctx.drawImage(img, 0, 0, smallerW, smallerH);
          result = canvasToDataUrl(canvas, mimeType, 0.72);
        }

        resolve({
          dataUrl: result,
          sizeKb: Math.round(dataUrlByteSize(result) / 1024),
          format: mimeType === 'image/webp' ? 'WebP' : 'JPEG',
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
