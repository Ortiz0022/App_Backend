import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiInstance: Brevo.TransactionalEmailsApi;
  private readonly sender: Brevo.SendSmtpEmailSender;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) throw new Error('Falta BREVO_API_KEY en .env');
    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    this.sender = { name: 'Cámara de Ganaderos', email: 'camara.ganaderos.hojancha1985@gmail.com' };
  }


  async sendResetPasswordEmail(to: string, resetLink: string) {
    const from = process.env.SMTP_FROM || 'no-reply@example.com'

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        <h2>Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para continuar:</p>
        <p>
          <a href="${resetLink}"
             style="display:inline-block;padding:12px 18px;background:#3b82f6;color:#fff;
                    text-decoration:none;border-radius:8px;font-weight:bold">
            Restablecer contraseña
          </a>
        </p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      </div>
    `

    const email: Brevo.SendSmtpEmail = {
      sender: this.sender,
      to: [{ email: to }],
      subject: 'Restablece tu contraseña',
      htmlContent: html,
    };

    try {
      await this.apiInstance.sendTransacEmail(email);
      this.logger.log(`✅ Correo enviado a ${to}`);
    } catch (e) {
      this.logger.error('❌ Error enviando email', e.response?.body || e);
      throw e;
    }
  }

    async sendConfirmEmailChange(to: string, confirmLink: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmar cambio de correo</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
              
              <!-- Header con logo -->
              <tr>
                <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png"
                       alt="Cámara de Ganaderos Hojancha"
                       style="width:80px;height:auto;margin:0 auto;display:block" />
                </td>
              </tr>

              <!-- Badge -->
              <tr>
                <td style="padding:0 40px 28px 40px;text-align:center">
                  <div style="display:inline-block;background-color:#F5F5DC;padding:10px 20px;border-radius:6px;border-left:4px solid #6B8E23">
                    <span style="color:#6B8E23;font-size:13px;font-weight:600;letter-spacing:0.5px">CONFIRMAR CORREO</span>
                  </div>
                  <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Seguridad de cuenta</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                  <p style="margin:0 0 18px 0;font-size:16px;color:#2d2d2d">
                    Hola,
                  </p>

                  <p style="margin:0 0 24px 0;font-size:15px">
                    Se solicitó actualizar el correo asociado a tu cuenta.
                    Para confirmar que este correo te pertenece, haz clic en el botón:
                  </p>

                  <p style="margin:0 0 28px 0;text-align:center">
                    <a href="${confirmLink}"
                       style="display:inline-block;padding:12px 18px;background:#6B8E23;color:#fff;
                              text-decoration:none;border-radius:8px;font-weight:700">
                      Confirmar correo
                    </a>
                  </p>

                  <div style="background-color:#fafafa;padding:18px;border-radius:8px;border-left:3px solid #6B8E23">
                    <p style="margin:0;font-size:13px;color:#737373;line-height:1.6">
                      Si no solicitaste este cambio, puedes ignorar este mensaje.
                      El enlace expirará en <strong>24 horas</strong>.
                    </p>
                  </div>

                  <p style="margin:24px 0 0 0;font-size:12px;color:#999999">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                    <span style="word-break:break-all;color:#6B8E23">${confirmLink}</span>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                  <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">
                    Cámara de Ganaderos de Hojancha
                  </p>
                  <p style="margin:0 0 12px 0;font-size:13px;color:#737373">
                    Seguridad y Configuración
                  </p>
                  <p style="margin:0;font-size:12px;color:#999999">
                    Este es un correo automático, por favor no responda directamente.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const email: Brevo.SendSmtpEmail = {
    sender: this.sender,
    to: [{ email: to }],
    subject: 'Confirma tu nuevo correo',
    htmlContent: html,
  };

  try {
    await this.apiInstance.sendTransacEmail(email);
    this.logger.log(`✅ Confirmación de correo enviada a ${to}`);
  } catch (e) {
    this.logger.error('❌ Error enviando confirmación de correo', e.response?.body || e);
    throw e;
  }
}


 async sendApplicationApprovalEmailVolunteers(to: string, nombre: string, tipoSolicitante: string): Promise<void> {
    const from = process.env.SMTP_FROM || "no-reply@example.com"

    const saludo = tipoSolicitante === "INDIVIDUAL" ? `Estimado/a ${nombre}` : `Estimados miembros de ${nombre}`

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud Aprobada</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                
                <!-- Header limpio con logo -->
                <tr>
                  <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                  </td>
                </tr>
                
                <!-- Badge de estado - Cambiado a etiqueta plana sin apariencia de botón -->
                <tr>
                  <td style="padding:0 40px 32px 40px;text-align:center">
                    <div style="display:inline-block;background-color:#F5F5DC;padding:10px 20px;border-radius:6px;border-left:4px solid #6B8E23">
                      <span style="color:#6B8E23;font-size:13px;font-weight:600;letter-spacing:0.5px">✓ SOLICITUD APROBADA</span>
                    </div>
                    <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Voluntarios</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                    <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">${saludo},</p>
                    
                    <p style="margin:0 0 24px 0;font-size:15px">
                      Nos complace informarle que su solicitud de voluntariado ha sido aprobada exitosamente.
                    </p>
                    
                    <p style="margin:0 0 32px 0;font-size:15px">
                      Estamos muy emocionados de que se una a nuestro equipo de voluntarios. 
                      Su compromiso y dedicación son invaluables para nuestra organización.
                    </p>
                    
                    <!-- Próximos pasos con acento verde sutil -->
                    <div style="background-color:#fafafa;padding:24px;margin:0 0 32px 0;border-radius:8px;border-left:3px solid #6B8E23">
                      <p style="color:#2d2d2d;margin:0 0 16px 0;font-size:15px;font-weight:600">Próximos pasos:</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:6px 0;font-size:14px;color:#4a4a4a">
                            <span style="color:#6B8E23;margin-right:8px">1.</span>
                            Nos pondremos en contacto en los próximos días
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;font-size:14px;color:#4a4a4a">
                            <span style="color:#6B8E23;margin-right:8px">2.</span>
                            Recibirá información sobre la orientación inicial
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;font-size:14px;color:#4a4a4a">
                            <span style="color:#6B8E23;margin-right:8px">3.</span>
                            Le enviaremos el cronograma de actividades
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <p style="margin:0;font-size:15px;color:#2d2d2d">
                      ¡Gracias por querer hacer la diferencia!
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">
                      Equipo de Voluntariado
                    </p>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#737373">
                      Cámara de Ganaderos
                    </p>
                    <p style="margin:0;font-size:12px;color:#999999">
                      Este es un correo automático, por favor no responda directamente.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const email: Brevo.SendSmtpEmail = {
      sender: this.sender,
      to: [{ email: to }],
      subject: 'Solicitud de voluntariado aprobada',
      htmlContent: html,
    };

    try {
      await this.apiInstance.sendTransacEmail(email);
      this.logger.log(`✅ Correo enviado a ${to}`);
    } catch (e) {
      this.logger.error('❌ Error enviando email', e.response?.body || e);
      throw e;
    }
  }

  async sendApplicationRejectionEmailVolunteers(
    to: string,
    nombre: string,
    motivo: string,
    tipoSolicitante: string,
  ): Promise<void> {
    const from = process.env.SMTP_FROM || "no-reply@example.com"

    const saludo = tipoSolicitante === "INDIVIDUAL" ? `Estimado/a ${nombre}` : `Estimados miembros de ${nombre}`

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Actualización de Solicitud</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                
                <!-- Header limpio con logo -->
                <tr>
                  <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                  </td>
                </tr>
                
                <!-- Badge de estado - Usando color rojo del botón rechazar y estilo de etiqueta plana -->
                <tr>
                  <td style="padding:0 40px 32px 40px;text-align:center">
                    <div style="display:inline-block;background-color:#FEE2E2;padding:10px 20px;border-radius:6px;border-left:4px solid #DC2626">
                      <span style="color:#DC2626;font-size:13px;font-weight:600;letter-spacing:0.5px">✕ SOLICITUD RECHAZADA</span>
                    </div>
                    <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Voluntarios</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                    <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">${saludo},</p>
                    
                    <p style="margin:0 0 24px 0;font-size:15px">
                      Gracias por su interés en formar parte de nuestro programa de voluntariado.
                    </p>
                    
                    <p style="margin:0 0 32px 0;font-size:15px">
                      Después de revisar cuidadosamente su solicitud, lamentamos informarle que 
                      en esta ocasión no hemos podido aprobar su participación.
                    </p>
                    
                    <!-- Motivo con borde rojo sutil -->
                    <div style="background-color:#fafafa;border-left:3px solid #DC2626;padding:20px;margin:0 0 32px 0;border-radius:8px">
                      <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#DC2626;text-transform:uppercase;letter-spacing:0.5px">
                        Motivo
                      </p>
                      <p style="margin:0;font-size:14px;color:#2d2d2d;line-height:1.6">${motivo}</p>
                    </div>
                    
                    <p style="margin:0 0 20px 0;font-size:15px">
                      Valoramos enormemente su interés, muchas gracias por su tiempo.
                    </p>
                    
                    <p style="margin:0;font-size:14px;color:#737373">
                      Si tiene alguna pregunta, no dude en contactarnos.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">
                      Equipo de Voluntariado
                    </p>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#737373">
                      Cámara de Ganaderos
                    </p>
                    <p style="margin:0;font-size:12px;color:#999999">
                      Este es un correo automático.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const email: Brevo.SendSmtpEmail = {
      sender: this.sender,
      to: [{ email: to }],
      subject: 'Solicitud de voluntariado rechazada',
      htmlContent: html,
    };

    try {
      await this.apiInstance.sendTransacEmail(email);
      this.logger.log(`✅ Correo enviado a ${to}`);
    } catch (e) {
      this.logger.error('❌ Error enviando email', e.response?.body || e);
      throw e;
    }
  }

async sendApplicationApprovedEmailAssociates(to: string, name?: string) {
    const from = process.env.SMTP_FROM || "no-reply@example.com"

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Solicitud Aprobada</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
              
              <!-- Header limpio con logo -->
              <tr>
                <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                </td>
              </tr>
              
              <!-- Badge de estado - Cambiado a etiqueta plana sin apariencia de botón -->
              <tr>
                <td style="padding:0 40px 32px 40px;text-align:center">
                  <div style="display:inline-block;background-color:#F5F5DC;padding:10px 20px;border-radius:6px;border-left:4px solid #6B8E23">
                    <span style="color:#6B8E23;font-size:13px;font-weight:600;letter-spacing:0.5px">✓ SOLICITUD APROBADA</span>
                  </div>
                  <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Asociados</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                  <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">Estimado(a) ${name ?? ""},</p>
                  
                  <p style="margin:0 0 32px 0;font-size:15px">
                    Su solicitud para ser asociado(a) ha sido aprobada exitosamente.
                  </p>
                  
                  <!-- Info importante con acento dorado -->
                  <div style="background-color:#fafafa;padding:24px;margin:0 0 32px 0;border-radius:8px;border-left:3px solid #D4A574">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#2d2d2d">
                      Por favor preséntese en la <strong>Cámara de Ganaderos de Hojancha</strong> 
                      para completar su registro.
                    </p>
                    <div style="background-color:#ffffff;padding:20px;border-radius:6px;text-align:center;border:1px solid #e5e5e5">
                      <p style="margin:0 0 8px 0;font-size:12px;color:#737373;text-transform:uppercase;letter-spacing:0.5px">
                        Cuota de inscripción
                      </p>
                      <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#D4A574">
                        ₡5,000
                      </p>
                      <p style="margin:0;font-size:14px;color:#4a4a4a;line-height:1.6">
                        Puede cancelar por <strong>SINPE Móvil</strong> al número: <strong style="color:#D4A574">8501 1152</strong>.<br/>
                        En el detalle agregue su número de cédula y posteriormente envíe el comprobante a este correo o a ese número.
                      </p>
                    </div>
                  </div>
                  
                  <p style="margin:0;font-size:15px;color:#2d2d2d">
                    Muchas gracias por su interés en formar parte de nuestra organización.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                  <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">
                    Cámara de Ganaderos de Hojancha
                  </p>
                  <p style="margin:0 0 12px 0;font-size:13px;color:#737373">
                    Departamento de Asociados
                  </p>
                  <p style="margin:0;font-size:12px;color:#999999">
                    Este es un correo automático, por favor no responda directamente.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

    const email: Brevo.SendSmtpEmail = {
      sender: this.sender,
      to: [{ email: to }],
      subject: 'Solicitud de asociado aprobada',
      htmlContent: html,
    };

    try {
      await this.apiInstance.sendTransacEmail(email);
      this.logger.log(`✅ Correo enviado a ${to}`);
    } catch (e) {
      this.logger.error('❌ Error enviando email', e.response?.body || e);
      throw e;
    } 
  }
  async sendApplicationRejectionEmailAssociates(to: string, name?: string, reason?: string) {
    const from = process.env.SMTP_FROM || "no-reply@example.com"

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Solicitud</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
              
              <!-- Header limpio con logo -->
              <tr>
                <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                </td>
              </tr>
              
              <!-- Badge de estado - Usando color rojo del botón rechazar y estilo de etiqueta plana -->
              <tr>
                <td style="padding:0 40px 32px 40px;text-align:center">
                  <div style="display:inline-block;background-color:#FEE2E2;padding:10px 20px;border-radius:6px;border-left:4px solid #DC2626">
                    <span style="color:#DC2626;font-size:13px;font-weight:600;letter-spacing:0.5px">✕ SOLICITUD RECHAZADA</span>
                  </div>
                  <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Asociados</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                  <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">Estimado(a) ${name ?? ""},</p>
                  
                  <p style="margin:0 0 32px 0;font-size:15px">
                    Lamentamos informarle que su solicitud de asociación no ha sido aprobada en esta ocasión.
                  </p>
                  
                  <!-- Motivo con borde rojo sutil -->
                  <div style="background-color:#fafafa;border-left:3px solid #DC2626;padding:20px;margin:0 0 32px 0;border-radius:8px">
                    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#DC2626;text-transform:uppercase;letter-spacing:0.5px">
                      Motivo
                    </p>
                    <p style="margin:0;font-size:14px;color:#2d2d2d;line-height:1.6">${reason ?? "No especificado"}</p>
                  </div>
                  
                  <p style="margin:0 0 20px 0;font-size:15px;color:#4a4a4a">
                    Si considera que hubo un error o desea más información, puede responder a este correo 
                    y con gusto le atenderemos.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                  <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">
                    Cámara de Ganaderos de Hojancha
                  </p>
                  <p style="margin:0 0 12px 0;font-size:13px;color:#737373">
                    Departamento de Asociados
                  </p>
                  <p style="margin:0;font-size:12px;color:#999999">
                    Este es un correo automático.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

   const email: Brevo.SendSmtpEmail = {
      sender: this.sender,
      to: [{ email: to }],
      subject: 'Solicitud de asociado rechazada',
      htmlContent: html,
    };

    try {
      await this.apiInstance.sendTransacEmail(email);
      this.logger.log(`✅ Correo enviado a ${to}`);
    } catch (e) {
      this.logger.error('❌ Error enviando email', e.response?.body || e);
      throw e;
    }
  }
}
