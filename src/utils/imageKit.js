import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'your_public_key_here';
const IK_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_id';

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

/**
 * Uploads an image to ImageKit using Firebase auth signature.
 * @param {File|Blob} file The image file or blob to upload.
 * @param {string} fileName The name to give to the file.
 * @returns {Promise<string>} The URL of the uploaded image.
 */
export const uploadToImageKit = async (file, fileName) => {
  if (!IK_PUBLIC_KEY || IK_PUBLIC_KEY === 'your_public_key_here') {
    throw new Error('ImageKit public key is not configured.');
  }

  try {
    // 1. Get auth signature from Firebase Cloud Function
    const getAuth = httpsCallable(functions, 'generateImageKitAuth');
    const { data } = await getAuth();

    // 2. Prepare FormData for direct upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('publicKey', IK_PUBLIC_KEY);
    formData.append('signature', data.signature);
    formData.append('expire', data.expire);
    formData.append('token', data.token);

    // 3. Upload to ImageKit
    const response = await fetch('https://upload.imagekit.io/api/v2/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Image upload failed');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
};
