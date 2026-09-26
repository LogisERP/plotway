// File Storage Abstraction
// Designed to work with GitHub REST API + jsDelivr CDN
//
// SECURITY NOTE:
// GitHub Personal Access Tokens MUST NOT be included in client-side code.
// A secure upload flow requires a backend/serverless endpoint to proxy uploads.
//
// Current implementation:
// - Upload: Stores base64 data URLs in Firestore (suitable for small property images)
// - Download/Display: Uses the stored data URL or CDN URL
// - The interface is designed so the storage provider can be swapped later
//   without rewriting property management code.

const MAX_IMAGE_SIZE = 800; // Max dimension in pixels
const JPEG_QUALITY = 0.7;

/**
 * Storage Provider Interface
 * All storage operations go through this abstraction.
 */
class StorageService {
  constructor() {
    this.provider = 'local'; // 'local' | 'github' | 'firebase'
  }

  /**
   * Upload a file and return a URL.
   * @param {File|Blob} file - The file to upload
   * @param {string} path - The intended storage path (e.g., 'properties/PROP-0001/photo1.jpg')
   * @returns {Promise<{url: string, path: string}>}
   */
  async upload(file, path) {
    // Compress image before storage
    const compressed = await this.compressImage(file);

    if (this.provider === 'github') {
      return this.uploadToGitHub(compressed, path);
    }

    // Default: return as data URL (stored in Firestore)
    return this.toDataUrl(compressed);
  }

  /**
   * Upload via GitHub REST API (requires a secure proxy)
   * NOT implemented with direct token — needs a serverless function.
   */
  async uploadToGitHub(file, path) {
    // TODO: Implement secure upload via serverless proxy endpoint
    // The proxy would:
    // 1. Accept the file from the client
    // 2. Use a server-side GitHub PAT to upload via REST API
    // 3. Return the jsDelivr CDN URL
    //
    // Example proxy endpoint: POST /api/upload
    // Example CDN URL: https://cdn.jsdelivr.net/gh/LogisERP/file-server@main/{path}
    //
    // For now, fall back to data URL storage
    console.warn('GitHub upload not yet configured — using local data URL storage');
    return this.toDataUrl(file);
  }

  /**
   * Convert file to data URL
   */
  async toDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        url: reader.result,
        path: `local/${Date.now()}`,
        provider: 'local'
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress an image file
   * @param {File|Blob} file
   * @returns {Promise<Blob>}
   */
  async compressImage(file) {
    // Skip non-images
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if needed
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = Math.round((height / width) * MAX_IMAGE_SIZE);
            width = MAX_IMAGE_SIZE;
          } else {
            width = Math.round((width / height) * MAX_IMAGE_SIZE);
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', JPEG_QUALITY);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Delete a file
   */
  async delete(path) {
    if (this.provider === 'github') {
      // TODO: Implement via secure proxy
      console.warn('GitHub delete not yet implemented');
    }
    // For local/data URL storage, deletion is handled by removing from Firestore
  }
}

// Singleton
const storage = new StorageService();
export default storage;
