import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Dropbox } from 'dropbox';

@Injectable()
export class DropboxService {
  constructor(@Inject('DROPBOX') private dbx: Dropbox) {
    if (!dbx) {
      throw new Error('Dropbox no está configurado. Ejecuta /auth/dropbox para obtener el refresh token.');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    dropboxPath: string,
  ): Promise<string> {
    try {
      // Asegurar que el path comience con /
      let fullPath = `${dropboxPath}/${file.originalname}`;
      
      if (!fullPath.startsWith('/')) {
        fullPath = `/${fullPath}`;
      }
      
      fullPath = fullPath.replace(/\/+/g, '/');

      const response = await this.dbx.filesUpload({
        path: fullPath,
        contents: file.buffer,
        mode: { '.tag': 'overwrite' },
        autorename: true,
      });

      const sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: response.result.path_display!,
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });

      return sharedLink.result.url;
    } catch (error: any) {
      console.error('[Dropbox] Error al subir archivo:', error.message);
      throw new BadRequestException(
        `Error al subir archivo a Dropbox: ${error.message}`,
      );
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const pathMatch = url.match(/\/s\/[^\/]+\/(.+)\?/);
      if (!pathMatch) {
        throw new Error('URL de Dropbox inválida');
      }

      const path = `/${pathMatch[1]}`;
      await this.dbx.filesDeleteV2({ path });
    } catch (error: any) {
      console.error('[Dropbox] Error al eliminar archivo:', error.message);
      throw new BadRequestException(
        `Error al eliminar archivo de Dropbox: ${error.message}`,
      );
    }
  }

  async ensureFolder(path: string): Promise<void> {
    try {
      await this.dbx.filesCreateFolderV2({
        path,
        autorename: false,
      });
    } catch (error: any) {
      // 409 significa que la carpeta ya existe (está bien)
      if (error.status !== 409) {
        console.error('[Dropbox] Error al crear carpeta:', error.message);
        throw error;
      }
    }
  }
}