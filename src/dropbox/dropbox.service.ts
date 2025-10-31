import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Dropbox } from 'dropbox';
@Injectable()
export class DropboxService {
  constructor(@Inject('DROPBOX') private dbx: Dropbox) {
    if (!dbx) {
      console.warn(
        '⚠️  Dropbox no configurado. Ejecuta /auth/dropbox para obtener el refresh token.'
      );
    }
  }

  /**
   * Valida que Dropbox esté inicializado antes de usarlo
   * @throws BadRequestException si no está configurado
   */
  private ensureInitialized() {
    if (!this.dbx) {
      throw new BadRequestException(
        'Dropbox no está configurado. Por favor, configura DROPBOX_REFRESH_TOKEN en .env y reinicia el servidor.'
      );
    }
  }

  /**
   * Sube un archivo a Dropbox
   * @param file - Archivo de Multer
   * @param dropboxPath - Ruta en Dropbox donde se guardará
   * @returns URL pública del archivo
   */
  async uploadFile(
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  },
  dropboxPath: string,
): Promise<string> {
    this.ensureInitialized();
    
    try {
      // Asegurar que el path comience con /
      let fullPath = `${dropboxPath}/${file.originalname}`;
      
      if (!fullPath.startsWith('/')) {
        fullPath = `/${fullPath}`;
      }
      
      // Limpiar barras duplicadas
      fullPath = fullPath.replace(/\/+/g, '/');


      // Subir archivo a Dropbox
      const response = await this.dbx.filesUpload({
        path: fullPath,
        contents: file.buffer,
        mode: { '.tag': 'overwrite' },
        autorename: true,
      });


      // Crear enlace compartido público
      const sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: response.result.path_display!,
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });


      return sharedLink.result.url;
    } catch (error: any) {
      console.error('[Dropbox] Error al subir archivo:', error.message);
      
      // Si el error es porque ya existe un enlace compartido, intentar obtenerlo
      if (error.error?.error['.tag'] === 'shared_link_already_exists') {
        try {
          const existingLinks = await this.dbx.sharingListSharedLinks({
            path: `${dropboxPath}/${file.originalname}`,
          });
          
          if (existingLinks.result.links.length > 0) {
            return existingLinks.result.links[0].url;
          }
        } catch (linkError: any) {
          console.error('[Dropbox] Error al obtener enlace existente:', linkError.message);
        }
      }
      
      throw new BadRequestException(
        `Error al subir archivo a Dropbox: ${error.message}`,
      );
    }
  }

  /**
   * Elimina un archivo de Dropbox usando su URL
   * @param url - URL del archivo en Dropbox
   */
  async deleteFile(url: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      // Extraer el path del archivo desde la URL
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

  /**
   * Crea una carpeta en Dropbox si no existe
   * @param path - Ruta de la carpeta a crear
   */
  async ensureFolder(path: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      
      await this.dbx.filesCreateFolderV2({
        path,
        autorename: false,
      });
      
    } catch (error: any) {
      // 409 significa que la carpeta ya existe (esto está bien)
      if (error.status === 409) {
        return;
      }
      
      console.error('[Dropbox] Error al crear carpeta:', error.message);
      throw error;
    }
  }

  /**
   * Lista archivos en una carpeta de Dropbox
   * @param path - Ruta de la carpeta
   * @returns Lista de archivos y carpetas
   */
  async listFolder(path: string): Promise<any> {
    this.ensureInitialized();
    
    try {
      
      const response = await this.dbx.filesListFolder({ path });
      
      
      return response.result.entries;
    } catch (error: any) {
      console.error('[Dropbox] Error al listar carpeta:', error.message);
      throw new BadRequestException(
        `Error al listar carpeta de Dropbox: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene información de un archivo
   * @param path - Ruta del archivo
   * @returns Metadata del archivo
   */
  async getFileMetadata(path: string): Promise<any> {
    this.ensureInitialized();
    
    try {
      
      const response = await this.dbx.filesGetMetadata({ path });

      
      return response.result;
    } catch (error: any) {
      console.error('[Dropbox] Error al obtener metadata:', error.message);
      throw new BadRequestException(
        `Error al obtener información del archivo: ${error.message}`,
      );
    }
  }

  /**
   * Descarga un archivo de Dropbox
   * @param path - Ruta del archivo
   * @returns Buffer del archivo
   */
  async downloadFile(path: string): Promise<Buffer> {
    this.ensureInitialized();
    
    try {
      
      const response = await this.dbx.filesDownload({ path });
      
      
      // @ts-ignore - La librería de Dropbox tiene tipos incompletos
      return response.result.fileBinary;
    } catch (error: any) {
      console.error('[Dropbox] Error al descargar archivo:', error.message);
      throw new BadRequestException(
        `Error al descargar archivo de Dropbox: ${error.message}`,
      );
    }
  }

  /**
   * Mueve o renombra un archivo/carpeta
   * @param fromPath - Ruta origen
   * @param toPath - Ruta destino
   */
  async moveFile(fromPath: string, toPath: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      
      await this.dbx.filesMoveV2({
        from_path: fromPath,
        to_path: toPath,
        autorename: false,
      });
      
    } catch (error: any) {
      console.error('[Dropbox] Error al mover archivo:', error.message);
      throw new BadRequestException(
        `Error al mover archivo en Dropbox: ${error.message}`,
      );
    }
  }

  /**
   * Copia un archivo
   * @param fromPath - Ruta origen
   * @param toPath - Ruta destino
   */
  async copyFile(fromPath: string, toPath: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      
      await this.dbx.filesCopyV2({
        from_path: fromPath,
        to_path: toPath,
        autorename: false,
      });
      
    } catch (error: any) {
      console.error('[Dropbox] Error al copiar archivo:', error.message);
      throw new BadRequestException(
        `Error al copiar archivo en Dropbox: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el espacio de almacenamiento usado
   * @returns Información de uso de espacio
   */
  async getSpaceUsage(): Promise<any> {
    this.ensureInitialized();
    
    try {
      
      const response = await this.dbx.usersGetSpaceUsage();
      
      const used = response.result.used;
      const allocated = response.result.allocation['.tag'] === 'individual' 
        ? response.result.allocation.allocated 
        : 0;
      
      
      return {
        used,
        allocated,
        usedGB: (used / 1024 / 1024 / 1024).toFixed(2),
        allocatedGB: (allocated / 1024 / 1024 / 1024).toFixed(2),
      };
    } catch (error: any) {
      console.error('[Dropbox] Error al obtener uso de espacio:', error.message);
      throw new BadRequestException(
        `Error al obtener información de espacio: ${error.message}`,
      );
    }
  }
}