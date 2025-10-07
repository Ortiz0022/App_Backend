import { Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

@Injectable()
export class DropboxService {
  private dbx: Dropbox;

  constructor(private configService: ConfigService) {
  const token = this.configService.get('DROPBOX_ACCESS_TOKEN');
  console.log('[Dropbox] Token encontrado:', token ? 'SÍ' : 'NO');
  console.log('[Dropbox] Primeros 15 caracteres:', token?.substring(0, 15));
  
  this.dbx = new Dropbox({
    accessToken: token,
    fetch: fetch as any,
  });
}

  async uploadFile(
    file: Express.Multer.File,
    path: string,
  ): Promise<string> {
    try {
      const response = await this.dbx.filesUpload({
        path: `/${path}/${file.originalname}`,
        contents: file.buffer,
        mode: { '.tag': 'overwrite' },
      });

      // Crear link compartido
      const sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: response.result.path_display ?? '',
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });

      return sharedLink.result.url;
    } catch (error: any) {
      console.error('[Dropbox] Error al subir archivo:', error);
      throw error;
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      // Extraer el path del URL
      const pathMatch = url.match(/\/s\/[^\/]+\/(.+)\?/);
      if (!pathMatch) throw new Error('URL inválida');

      const path = `/${pathMatch[1]}`;
      await this.dbx.filesDeleteV2({ path });
    } catch (error: any) {
      console.error('[Dropbox] Error al eliminar archivo:', error);
      throw error;
    }
  }
}