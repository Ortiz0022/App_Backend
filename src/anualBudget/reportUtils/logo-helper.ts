import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

export class LogoHelper {
  private static readonly LOGO_URL =
    'https://res.cloudinary.com/dyigmavwq/image/upload/v1773373691/bpleevs18w1zeuxryvqg.jpg';

  // fallback local opcional
  private static readonly LOCAL_FALLBACKS = [
    path.resolve(process.cwd(), 'src/assets/logo-report.jpg'),
    path.resolve(process.cwd(), 'dist/assets/logo-report.jpg'),
  ];

  private static cachedLogo: Buffer | null = null;
  private static loadingPromise: Promise<Buffer | null> | null = null;

  private static async fetchRemoteLogo(): Promise<Buffer | null> {
    try {
      const response = await axios.get<ArrayBuffer>(this.LOGO_URL, {
        responseType: 'arraybuffer',
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const contentType = String(response.headers['content-type'] || '').toLowerCase();
      const allowed = ['image/png', 'image/jpeg', 'image/jpg'];

      if (contentType && !allowed.some((t) => contentType.includes(t))) {
        console.error(`LogoHelper: formato no soportado por PDFKit (${contentType})`);
        return null;
      }

      const buffer = Buffer.from(response.data);
      if (!buffer.length) {
        console.error('LogoHelper: buffer remoto vacío');
        return null;
      }

      return buffer;
    } catch (error) {
      console.error('LogoHelper: error descargando logo remoto:', error);
      return null;
    }
  }

  private static async fetchLocalLogo(): Promise<Buffer | null> {
    for (const filePath of this.LOCAL_FALLBACKS) {
      try {
        const file = await fs.readFile(filePath);
        if (file.length) {
          return file;
        }
      } catch {
        // seguir intentando con el siguiente fallback
      }
    }
    return null;
  }

  static async preloadLogo(): Promise<void> {
    await this.getLogo();
  }

  static async getLogo(forceRefresh = false): Promise<Buffer | null> {
    if (!forceRefresh && this.cachedLogo?.length) {
      return this.cachedLogo;
    }

    if (!forceRefresh && this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      const remoteLogo = await this.fetchRemoteLogo();
      if (remoteLogo) {
        this.cachedLogo = remoteLogo;
        return remoteLogo;
      }

      const localLogo = await this.fetchLocalLogo();
      if (localLogo) {
        this.cachedLogo = localLogo;
        return localLogo;
      }

      this.cachedLogo = null;
      return null;
    })();

    try {
      return await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  static getLogoSync(): Buffer | null {
    return this.cachedLogo?.length ? this.cachedLogo : null;
  }

  static clearCache() {
    this.cachedLogo = null;
    this.loadingPromise = null;
  }
}