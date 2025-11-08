import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY no definido en .env');
      // No lanzamos aquí para no romper el arranque; los métodos fallarán al enviar.
    }
    this.resend = new Resend(apiKey);
    this.from =
      process.env.RESEND_FROM ||
      'Cámara de Ganaderos <onboarding@resend.dev>'; // Remitente por defecto de Resend
  }

  private async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const res = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      this.logger.log(
        `Email enviado a ${to} — id: ${res?.data?.id ?? 'sin-id'} status: ${
          res?.error ? 'error' : 'ok'
        }`,
      );
      if (res?.error) {
        throw new Error(
          `Resend error: ${res.error.name} - ${res.error.message}`,
        );
      }
      return res?.data;
    } catch (err) {
      this.logger.error(`Fallo enviando email a ${to}`, err as any);
      throw err;
    }
  }

  // ==========================
  // 1) Reset de contraseña
  // ==========================
  async sendResetPasswordEmail(to: string, resetLink: string) {
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        <h2>Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para continuar:</p>
        <p>
          <a href="${resetLink}"
             style="display:inline-block;padding:12px 18px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">
            Restablecer contraseña
          </a>
        </p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      </div>
    `;
    return this.sendEmail({
      to,
      subject: 'Restablece tu contraseña',
      html,
    });
  }

  // ==========================================================
  // 2) Aprobación Voluntarios (html basado en tu implementación)
  // ==========================================================
  async sendApplicationApprovalEmailVolunteers(
    to: string,
    nombre: string,
    tipoSolicitante: string,
  ): Promise<void> {
    const saludo =
      tipoSolicitante === 'INDIVIDUAL'
        ? `Estimado/a ${nombre}`
        : `Estimados miembros de ${nombre}`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Solicitud Aprobada</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                <tr>
                  <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px 40px;text-align:center">
                    <div style="display:inline-block;background-color:#F5F5DC;padding:10px 20px;border-radius:6px;border-left:4px solid #6B8E23">
                      <span style="color:#6B8E23;font-size:13px;font-weight:600;letter-spacing:0.5px">✓ SOLICITUD APROBADA</span>
                    </div>
                    <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Voluntarios</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                    <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">${saludo},</p>
                    <p style="margin:0 0 24px 0;font-size:15px">
                      Nos complace informarle que su solicitud de voluntariado ha sido aprobada exitosamente.
                    </p>
                    <p style="margin:0 0 32px 0;font-size:15px">
                      Estamos muy emocionados de que se una a nuestro equipo de voluntarios.
                    </p>
                    <div style="background-color:#fafafa;padding:24px;margin:0 0 32px 0;border-radius:8px;border-left:3px solid #6B8E23">
                      <p style="color:#2d2d2d;margin:0 0 16px 0;font-size:15px;font-weight:600">Próximos pasos:</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr><td style="padding:6px 0;font-size:14px;color:#4a4a4a"><span style="color:#6B8E23;margin-right:8px">1.</span> Nos pondremos en contacto en los próximos días</td></tr>
                        <tr><td style="padding:6px 0;font-size:14px;color:#4a4a4a"><span style="color:#6B8E23;margin-right:8px">2.</span> Recibirá información sobre la orientación inicial</td></tr>
                        <tr><td style="padding:6px 0;font-size:14px;color:#4a4a4a"><span style="color:#6B8E23;margin-right:8px">3.</span> Le enviaremos el cronograma de actividades</td></tr>
                      </table>
                    </div>
                    <p style="margin:0;font-size:15px;color:#2d2d2d">¡Gracias por querer hacer la diferencia!</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">Equipo de Voluntariado</p>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#737373">Cámara de Ganaderos</p>
                    <p style="margin:0;font-size:12px;color:#999999">Este es un correo automático, por favor no responda directamente.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: '¡Felicidades! Tu solicitud de voluntariado ha sido aprobada',
      html,
    });
  }

  // ===========================================================
  // 3) Rechazo Voluntarios (html basado en tu implementación)
  // ===========================================================
  async sendApplicationRejectionEmailVolunteers(
    to: string,
    nombre: string,
    motivo: string,
    tipoSolicitante: string,
  ): Promise<void> {
    const saludo =
      tipoSolicitante === 'INDIVIDUAL'
        ? `Estimado/a ${nombre}`
        : `Estimados miembros de ${nombre}`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Actualización de Solicitud</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                <tr>
                  <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px 40px;text-align:center">
                    <div style="display:inline-block;background-color:#FEE2E2;padding:10px 20px;border-radius:6px;border-left:4px solid #DC2626">
                      <span style="color:#DC2626;font-size:13px;font-weight:600;letter-spacing:0.5px">✕ SOLICITUD RECHAZADA</span>
                    </div>
                    <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Voluntarios</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                    <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">${saludo},</p>
                    <p style="margin:0 0 24px 0;font-size:15px">Gracias por su interés en formar parte de nuestro programa de voluntariado.</p>
                    <p style="margin:0 0 32px 0;font-size:15px">Después de revisar cuidadosamente su solicitud, lamentamos informarle que en esta ocasión no hemos podido aprobar su participación.</p>
                    <div style="background-color:#fafafa;border-left:3px solid #DC2626;padding:20px;margin:0 0 32px 0;border-radius:8px">
                      <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#DC2626;text-transform:uppercase;letter-spacing:0.5px">Motivo</p>
                      <p style="margin:0;font-size:14px;color:#2d2d2d;line-height:1.6">${motivo}</p>
                    </div>
                    <p style="margin:0;font-size:14px;color:#737373">Si tiene alguna pregunta, no dude en contactarnos.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">Equipo de Voluntariado</p>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#737373">Cámara de Ganaderos</p>
                    <p style="margin:0;font-size:12px;color:#999999">Este es un correo automático.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Actualización sobre tu solicitud de voluntariado',
      html,
    });
  }

  // ===========================================================
  // 4) Aprobación Asociados
  // ===========================================================
  async sendApplicationApprovedEmailAssociates(to: string, name?: string) {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Solicitud Aprobada</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                <tr>
                  <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px 40px;text-align:center">
                    <div style="display:inline-block;background-color:#F5F5DC;padding:10px 20px;border-radius:6px;border-left:4px solid #6B8E23">
                      <span style="color:#6B8E23;font-size:13px;font-weight:600;letter-spacing:0.5px">✓ SOLICITUD APROBADA</span>
                    </div>
                    <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Asociados</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                    <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">Estimado(a) ${name ?? ''},</p>
                    <p style="margin:0 0 32px 0;font-size:15px">Su solicitud para ser asociado(a) ha sido aprobada exitosamente.</p>
                    <div style="background-color:#fafafa;padding:24px;margin:0 0 32px 0;border-radius:8px;border-left:3px solid #D4A574">
                      <p style="margin:0 0 16px 0;font-size:15px;color:#2d2d2d">
                        Por favor preséntese en la <strong>Cámara de Ganaderos de Hojancha</strong> para completar su registro.
                      </p>
                      <div style="background-color:#ffffff;padding:20px;border-radius:6px;text-align:center;border:1px solid #e5e5e5">
                        <p style="margin:0 0 8px 0;font-size:12px;color:#737373;text-transform:uppercase;letter-spacing:0.5px">Cuota de inscripción</p>
                        <p style="margin:0;font-size:28px;font-weight:700;color:#D4A574">₡5,000</p>
                      </div>
                    </div>
                    <p style="margin:0;font-size:15px;color:#2d2d2d">Muchas gracias por su interés en formar parte de nuestra organización.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">Cámara de Ganaderos de Hojancha</p>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#737373">Departamento de Asociados</p>
                    <p style="margin:0;font-size:12px;color:#999999">Este es un correo automático, por favor no responda directamente.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Solicitud de asociación aprobada',
      html,
    });
  }

  // ===========================================================
  // 5) Rechazo Asociados
  // ===========================================================
  async sendApplicationRejectionEmailAssociates(
    to: string,
    name?: string,
    reason?: string,
  ) {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Actualización de Solicitud</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#F5F5DC">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5DC;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                <tr>
                  <td style="padding:40px 40px 24px 40px;text-align:center;background-color:#ffffff">
                    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png" alt="Cámara de Ganaderos Hojancha" style="width:80px;height:auto;margin:0 auto;display:block" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px 40px;text-align:center">
                    <div style="display:inline-block;background-color:#FEE2E2;padding:10px 20px;border-radius:6px;border-left:4px solid #DC2626">
                      <span style="color:#DC2626;font-size:13px;font-weight:600;letter-spacing:0.5px">✕ SOLICITUD RECHAZADA</span>
                    </div>
                    <p style="margin:12px 0 0 0;font-size:13px;color:#999999">Asociados</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 40px 40px;color:#4a4a4a;line-height:1.7">
                    <p style="margin:0 0 20px 0;font-size:16px;color:#2d2d2d">Estimado(a) ${name ?? ''},</p>
                    <p style="margin:0 0 32px 0;font-size:15px">Lamentamos informarle que su solicitud de asociación no ha sido aprobada en esta ocasión.</p>
                    <div style="background-color:#fafafa;border-left:3px solid #DC2626;padding:20px;margin:0 0 32px 0;border-radius:8px">
                      <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#DC2626;text-transform:uppercase;letter-spacing:0.5px">Motivo</p>
                      <p style="margin:0;font-size:14px;color:#2d2d2d;line-height:1.6">${reason ?? 'No especificado'}</p>
                    </div>
                    <p style="margin:0 0 20px 0;font-size:15px;color:#4a4a4a">Si considera que hubo un error o desea más información, puede responder a este correo y con gusto le atenderemos.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5">
                    <p style="margin:0 0 4px 0;font-size:13px;color:#2d2d2d;font-weight:600">Cámara de Ganaderos de Hojancha</p>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#737373">Departamento de Asociados</p>
                    <p style="margin:0;font-size:12px;color:#999999">Este es un correo automático.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: 'Solicitud de asociación rechazada',
      html,
    });
  }
}
