import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';
import { ApiError } from '../../utils/ApiError.js';
import { config } from '../../config/env.js';

export class UploadService {
  static async uploadFile(file) {
    if (!file) {
      throw new ApiError(400, 'No file provided');
    }

    // Check if Cloudinary credentials are provided
    if (
      config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
    ) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'bakery_app',
        });
        // Remove local temporary file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return {
          url: result.secure_url,
          public_id: result.public_id,
          provider: 'cloudinary',
        };
      } catch (error) {
        throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
      }
    }

    // Fallback to local storage path
    const localUrl = `/uploads/${file.filename}`;
    return {
      url: localUrl,
      filename: file.filename,
      provider: 'local',
    };
  }
}
