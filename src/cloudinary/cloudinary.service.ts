import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: 'da6jszhod',
      api_key: '452922382748891',
      api_secret: 'SR2HU1yShUy5L-5WfSDAk8vBfck',
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string) {
  return new Promise((resolve, reject) => {
    // Generar nombre limpio del archivo (sin extensión)
    const fileName = file.originalname.split('.')[0];
    
    cloudinary.uploader
      .upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          public_id: fileName, // ← Agregar esta línea
          use_filename: true,  // ← Agregar esta línea
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      )
      .end(file.buffer);
  });
}

  async createFolder(folderName: string) {
    // Cloudinary crea carpetas automáticamente al subir archivos
    return { folder: folderName };
  }

  getRootFolderUrl() {
    return `https://console.cloudinary.com/console/da6jszhod/media_library/folders`;
  }
}