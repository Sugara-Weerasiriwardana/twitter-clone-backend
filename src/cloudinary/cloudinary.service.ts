import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
 
  async uploadMedia(file: Express.Multer.File) {
    try {
      console.log('Uploading file:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'present' : 'missing'
      });

      // Convert buffer to data URI
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: 'auto',
        folder: 'twitter-clone'
      });

      console.log('Upload successful:', result);
      return { url: result.secure_url };
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<any[]> {
    const uploadPromises = files.map(file => this.uploadMedia(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}
