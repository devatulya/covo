const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Compresses an image file before upload.
 * @param {File} file The original image file.
 * @param {number} maxWidth Maximum width of the image.
 * @param {number} quality Compression quality (0 to 1).
 * @returns {Promise<Blob>} The compressed image blob.
 */
export const compressImage = (file, maxWidth = 720, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // If it's not an image, resolve with original
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Only resize if width is greater than maxWidth
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

/**
 * Uploads an image to ImageKit through covo-feed.
 * @param {File|Blob} file The image file or blob to upload.
 * @param {string} fileName The name to give to the file.
 * @returns {Promise<string>} The URL of the uploaded image.
 */
export const uploadToImageKit = async (file, fileName) => {
  try {
    const fileDataUrl = await blobToDataUrl(file);
    const response = await fetch(`${API_BASE_URL}/imagekit-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: fileDataUrl,
        fileName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Image upload failed');
    }

    const result = await response.json();
    if (!result.url) {
      throw new Error('ImageKit upload did not return a URL');
    }

    return result.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
};
