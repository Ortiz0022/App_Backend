import axios from 'axios';

export class LogoHelper {
  private static readonly LOGO_URL = 'https://res.cloudinary.com/dyigmavwq/image/upload/v1760638578/logo-camara_fw64kt.png';
  private static cachedLogo: Buffer | null = null;
  private static loadingPromise: Promise<Buffer> | null = null;

  // ✅ NUEVO: Método que pre-carga el logo
  static async preloadLogo(): Promise<void> {
    if (this.cachedLogo) return;
    try {
      const response = await axios.get(this.LOGO_URL, {
        responseType: 'arraybuffer',
      });
      this.cachedLogo = Buffer.from(response.data);
    } catch (error) {
      console.error('Error precargando logo:', error);
    }
  }

  // ✅ Método async (original)
  static async getLogo(): Promise<Buffer> {
    if (this.cachedLogo) {
      return this.cachedLogo;
    }

    try {
      const response = await axios.get(this.LOGO_URL, {
        responseType: 'arraybuffer',
      });
      
      this.cachedLogo = Buffer.from(response.data);
      return this.cachedLogo;
    } catch (error) {
      console.error('Error descargando logo:', error);
      return Buffer.from('');
    }
  }

  // ✅ NUEVO: Método síncrono (solo devuelve si ya está en caché)
  static getLogoSync(): Buffer | null {
    return this.cachedLogo;
  }

  static clearCache() {
    this.cachedLogo = null;
  }
}