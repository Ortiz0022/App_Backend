import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import * as crypto from 'crypto';

// Cache temporal en memoria (solo para desarrollo)
const verifierCache = new Map<string, { verifier: string; timestamp: number }>();

// Limpiar cache cada 15 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verifierCache.entries()) {
    // Eliminar entradas mayores a 15 minutos
    if (now - value.timestamp > 15 * 60 * 1000) {
      verifierCache.delete(key);
      console.log(`🧹 Cache limpiado: ${key}`);
    }
  }
}, 5 * 60 * 1000); // Ejecutar cada 5 minutos

@Controller('auth/dropbox')
export class DropboxAuthController {
  constructor(private configService: ConfigService) {}

  @Get()
  async authorize(@Res() res: Response) {
    const clientId = this.configService.get<string>('DROPBOX_APP_KEY')!;
    const redirectUri = this.configService.get<string>('DROPBOX_REDIRECT_URI')!;

    // Generar code_verifier y code_challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const state = this.generateRandomString(32); // Más largo para más seguridad

    // Guardar en cache temporal con timestamp
    verifierCache.set(state, {
      verifier: codeVerifier,
      timestamp: Date.now(),
    });

    console.log('🚀 Iniciando autorización PKCE');
    console.log('State generado:', state);
    console.log('Code Verifier guardado en cache');
    console.log('Cache size:', verifierCache.size);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      token_access_type: 'offline',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    });

    const authUrl = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
    
    console.log('🔗 Redirigiendo a:', authUrl);
    
    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    try {
      console.log('📥 Callback recibido');
      console.log('Code:', code ? '✅ Presente' : '❌ Ausente');
      console.log('State:', state ? `✅ ${state}` : '❌ Ausente');
      console.log('Cache size:', verifierCache.size);

      // Verificar si hay error de Dropbox
      if (error) {
        console.error('❌ Error de Dropbox:', error);
        console.error('Descripción:', errorDescription);
        throw new Error(`Error de Dropbox: ${error} - ${errorDescription}`);
      }

      if (!code) {
        throw new Error('Código de autorización faltante');
      }

      if (!state) {
        // Mostrar información de debug
        console.error('❌ State faltante');
        console.error('Cache actual:', Array.from(verifierCache.keys()));
        
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>❌ Error de Autorización</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
              }
              .container {
                background: white;
                max-width: 700px;
                width: 100%;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              h1 { color: #e74c3c; margin-bottom: 20px; }
              .error-box {
                background: #ffebee;
                border-left: 4px solid #e74c3c;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .btn {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              }
              .btn:hover { background: #5568d3; }
              code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Error de Autorización</h1>
              <div class="error-box">
                <p><strong>El parámetro "state" no fue recibido.</strong></p>
                <p style="margin-top: 10px;">Esto puede ocurrir si:</p>
                <ul style="margin: 10px 0 0 20px;">
                  <li>La URL de redirección no está correctamente configurada en Dropbox</li>
                  <li>El navegador bloqueó cookies o parámetros de URL</li>
                  <li>Hubo un problema temporal con Dropbox</li>
                </ul>
              </div>
              
              <h3 style="margin-top: 30px;">🔧 Solución:</h3>
              <ol style="margin: 15px 0 0 20px; line-height: 1.8;">
                <li>Verifica que en tu App de Dropbox tengas configurado:
                  <br><code>http://localhost:3000/auth/dropbox/callback</code>
                </li>
                <li>Intenta en modo incógnito del navegador</li>
                <li>Asegúrate de que el servidor esté corriendo</li>
              </ol>
              
              <a href="/auth/dropbox" class="btn">🔄 Intentar de nuevo</a>
            </div>
          </body>
          </html>
        `);
      }

      // Recuperar code_verifier del cache
      const cached = verifierCache.get(state);
      
      if (!cached) {
        console.error('❌ Code verifier no encontrado en cache');
        console.error('States disponibles:', Array.from(verifierCache.keys()));
        throw new Error('Sesión expirada. Por favor, inicia el proceso de nuevo.');
      }

      const codeVerifier = cached.verifier;

      // Limpiar del cache
      verifierCache.delete(state);
      console.log('✅ Code verifier recuperado del cache');
      console.log('Cache restante:', verifierCache.size);

      const clientId = this.configService.get<string>('DROPBOX_APP_KEY')!;
      const clientSecret = this.configService.get<string>('DROPBOX_APP_SECRET')!;
      const redirectUri = this.configService.get<string>('DROPBOX_REDIRECT_URI')!;

      console.log('🔄 Intercambiando código por tokens con PKCE...');

      const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }).toString(),
      });

      const responseText = await tokenResponse.text();
      console.log('📥 Respuesta status:', tokenResponse.status);

      if (!tokenResponse.ok) {
        console.error('❌ Error de Dropbox:', responseText);
        throw new Error(`Dropbox error: ${responseText}`);
      }

      const tokenData = JSON.parse(responseText);

      console.log('✅ Tokens obtenidos exitosamente');
      console.log('Refresh Token:', tokenData.refresh_token ? 'PRESENTE ✓' : 'AUSENTE ✗');

      if (!tokenData.refresh_token) {
        throw new Error('No se obtuvo refresh_token');
      }

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>✅ Dropbox Conectado</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0061FF 0%, #60EFFF 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              max-width: 900px;
              width: 100%;
              padding: 50px;
              border-radius: 20px;
              box-shadow: 0 25px 80px rgba(0,0,0,0.25);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .check-icon {
              width: 80px;
              height: 80px;
              background: #00D26A;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              animation: scaleIn 0.3s ease-out;
            }
            @keyframes scaleIn {
              from { transform: scale(0); }
              to { transform: scale(1); }
            }
            .check-icon::before {
              content: '✓';
              font-size: 50px;
              color: white;
              font-weight: bold;
            }
            h1 {
              color: #0061FF;
              font-size: 36px;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #00875A;
              font-size: 20px;
              font-weight: 600;
            }
            .steps {
              background: #FFF8E1;
              padding: 30px;
              border-radius: 12px;
              border-left: 6px solid #FFC107;
              margin: 30px 0;
            }
            .steps h3 {
              color: #F57C00;
              margin-bottom: 20px;
              font-size: 22px;
            }
            .steps ol {
              margin-left: 24px;
            }
            .steps li {
              margin: 12px 0;
              line-height: 1.7;
              font-size: 16px;
            }
            .token-section {
              margin: 30px 0;
            }
            .token-section h3 {
              color: #333;
              margin-bottom: 15px;
              font-size: 20px;
            }
            .token-box {
              background: #F8F9FA;
              padding: 25px;
              border-radius: 10px;
              border: 3px solid #0061FF;
              position: relative;
              word-break: break-all;
              font-family: 'Courier New', monospace;
              font-size: 14px;
              line-height: 1.8;
              max-height: 150px;
              overflow-y: auto;
            }
            .copy-btn {
              position: absolute;
              top: 15px;
              right: 15px;
              background: #0061FF;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              transition: all 0.2s;
            }
            .copy-btn:hover {
              background: #0051D5;
              transform: translateY(-2px);
            }
            .copy-btn:active {
              transform: translateY(0);
            }
            code {
              background: #E9ECEF;
              padding: 4px 10px;
              border-radius: 5px;
              font-family: 'Courier New', monospace;
              color: #D63384;
              font-size: 14px;
            }
            .env-example {
              background: #263238;
              color: #AED581;
              padding: 20px;
              border-radius: 8px;
              font-family: 'Courier New', monospace;
              margin: 20px 0;
              font-size: 14px;
              overflow-x: auto;
            }
            .warning {
              background: #FFEBEE;
              padding: 25px;
              border-radius: 12px;
              border-left: 6px solid #F44336;
              margin-top: 30px;
            }
            .warning strong {
              color: #C62828;
              display: block;
              margin-bottom: 12px;
              font-size: 18px;
            }
            .warning ul {
              margin-left: 24px;
            }
            .warning li {
              margin: 10px 0;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="check-icon"></div>
              <h1>¡Conexión Exitosa!</h1>
              <p class="subtitle">Tu cuenta de Dropbox está conectada</p>
            </div>
            
            <div class="steps">
              <h3>📋 Configura tu aplicación:</h3>
              <ol>
                <li>Haz clic en <strong>"📋 Copiar Token"</strong></li>
                <li>Abre el archivo <code>.env</code> de tu proyecto</li>
                <li>Busca la línea: <code>DROPBOX_REFRESH_TOKEN=</code></li>
                <li>Pega el token después del signo <code>=</code></li>
                <li>Guarda el archivo <code>.env</code></li>
                <li>Reinicia tu servidor de NestJS</li>
              </ol>
            </div>

            <div class="token-section">
              <h3>🔑 Tu Refresh Token:</h3>
              <div class="token-box" id="tokenBox">
                <button class="copy-btn" onclick="copyToken()">📋 Copiar Token</button>
                ${tokenData.refresh_token}
              </div>
            </div>

            <h4 style="margin-top: 30px; color: #333;">Ejemplo de configuración en .env:</h4>
            <div class="env-example">DROPBOX_REFRESH_TOKEN=${tokenData.refresh_token}</div>

            <div class="warning">
              <strong>⚠️ Seguridad Importante</strong>
              <ul>
                <li>Este token es <strong>permanente</strong> y no expira</li>
                <li><strong>NUNCA</strong> lo subas a GitHub o repositorios públicos</li>
                <li>Verifica que <code>.env</code> esté en tu <code>.gitignore</code></li>
                <li>No lo compartas con terceros</li>
                <li>Si lo pierdes, repite este proceso para generar uno nuevo</li>
              </ul>
            </div>
          </div>

          <script>
            function copyToken() {
              const token = '${tokenData.refresh_token}';
              navigator.clipboard.writeText(token).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '✅ ¡Copiado!';
                btn.style.background = '#00875A';
                
                setTimeout(() => {
                  btn.textContent = originalText;
                  btn.style.background = '#0061FF';
                }, 2500);
              }).catch(err => {
                alert('Error al copiar. Por favor, selecciona y copia manualmente.');
              });
            }
          </script>
        </body>
        </html>
      `);
    } catch (error: any) {
      console.error('❌ Error completo:', error.message);
      
      res.status(500).send(`
        <div style="font-family: Arial; max-width: 700px; margin: 50px auto; padding: 30px; background: #FFEBEE; border-radius: 12px; border-left: 6px solid #F44336;">
          <h1 style="color: #C62828; margin-bottom: 15px;">❌ Error en la autenticación</h1>
          <p style="margin: 15px 0;"><strong>Mensaje:</strong> ${error.message}</p>
          <p style="margin: 15px 0;">Por favor revisa los logs del servidor para más detalles.</p>
          <a href="/auth/dropbox" style="display: inline-block; margin-top: 25px; padding: 12px 24px; background: #0061FF; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">← Intentar de nuevo</a>
        </div>
      `);
    }
  }

  // Generar code_verifier (128 caracteres random)
  private generateCodeVerifier(): string {
    return crypto.randomBytes(64).toString('base64url');
  }

  // Generar code_challenge a partir del verifier
  private generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }

  // Generar string random para state
  private generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }
}