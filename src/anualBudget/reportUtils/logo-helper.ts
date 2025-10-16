import axios from 'axios';

export class LogoHelper {
  private static readonly LOGO_URL = 'https://res.cloudinary.com/dyigmavwq/image/upload/v1760638578/logo-camara_fw64kt.png';
  private static cachedLogo: Buffer | null = null;

  static async getLogo(): Promise<Buffer> {
    // Si ya tenemos el logo en caché, lo retornamos
    if (this.cachedLogo) {
      return this.cachedLogo;
    }

    try {
      // Descargar el logo
      const response = await axios.get(this.LOGO_URL, {
        responseType: 'arraybuffer',
      });
      
      this.cachedLogo = Buffer.from(response.data);
      return this.cachedLogo;
    } catch (error) {
      console.error('Error descargando logo:', error);
      // Retornar un buffer vacío si falla
      return Buffer.from('');
    }
  }

  static clearCache() {
    this.cachedLogo = null;
  }
}