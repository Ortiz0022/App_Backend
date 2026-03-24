import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Brevo from '@getbrevo/brevo'

type Tone = 'success' | 'warning' | 'danger' | 'info'

type InternalNotificationPayload = {
  applicantName: string
  applicantEmail: string
  applicantId: string
  tipoSolicitante?: string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly apiInstance: Brevo.TransactionalEmailsApi
  private readonly sender: Brevo.SendSmtpEmailSender

  private readonly senderEmail = 'camara.ganaderos.hojancha1985@gmail.com'
  private readonly logoUrl =
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-camara-iok26UPZx7aeGSyqeWR5iqJkSDrixR.png'

  private readonly associatesNotificationTo: string
  private readonly volunteersNotificationTo: string

  private readonly colors = {
    bg: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceSoft: '#FAFAFA',
    text: '#1F2937',
    muted: '#6B7280',
    border: '#E5E7EB',
    green: '#5B732E',
    greenSoft: 'rgba(91, 115, 46, 0.08)',
    gold: '#C19A3D',
    goldSoft: 'rgba(193, 154, 61, 0.10)',
    red: '#DC2626',
    redSoft: 'rgba(220, 38, 38, 0.08)',
    blue: '#2563EB',
    blueSoft: 'rgba(37, 99, 235, 0.08)',
  }

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('BREVO_API_KEY')
    if (!apiKey) throw new Error('Falta BREVO_API_KEY en .env')

    this.apiInstance = new Brevo.TransactionalEmailsApi()
    this.apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    )

    this.sender = {
      name: 'Cámara de Ganaderos',
      email: this.senderEmail,
    }

    this.associatesNotificationTo =
      this.config.get<string>('BREVO_ASSOCIATES_NOTIFICATION_TO')?.trim() ||
      this.senderEmail

    this.volunteersNotificationTo =
      this.config.get<string>('BREVO_VOLUNTEERS_NOTIFICATION_TO')?.trim() ||
      this.senderEmail
  }

  private escapeHtml(value?: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  private formatNowCostaRica(): string {
    return new Intl.DateTimeFormat('es-CR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Costa_Rica',
    }).format(new Date())
  }

  private toRecipients(value: string | string[]): { email: string }[] {
    const raw = Array.isArray(value) ? value : value.split(',')

    const recipients = raw
      .map((item) => item.trim())
      .filter(Boolean)
      .map((email) => ({ email }))

    return recipients.length ? recipients : [{ email: this.senderEmail }]
  }

  private getToneStyles(tone: Tone) {
    switch (tone) {
      case 'success':
        return {
          accent: this.colors.green,
          soft: this.colors.greenSoft,
          button: this.colors.green,
        }
      case 'warning':
        return {
          accent: this.colors.gold,
          soft: this.colors.goldSoft,
          button: this.colors.gold,
        }
      case 'danger':
        return {
          accent: this.colors.red,
          soft: this.colors.redSoft,
          button: this.colors.red,
        }
      case 'info':
      default:
        return {
          accent: this.colors.blue,
          soft: this.colors.blueSoft,
          button: this.colors.blue,
        }
    }
  }

  private buildButton(label: string, href: string, tone: Tone = 'info') {
    const styles = this.getToneStyles(tone)

    return `
      <div style="margin:0 0 24px 0;">
        <a
          href="${this.escapeHtml(href)}"
          style="
            display:inline-block;
            padding:12px 18px;
            border-radius:12px;
            background:${styles.button};
            color:#ffffff;
            text-decoration:none;
            font-size:14px;
            font-weight:700;
            box-shadow:0 8px 18px rgba(17,24,39,.08);
          "
        >
          ${this.escapeHtml(label)}
        </a>
      </div>
    `
  }

  private buildPanel(title: string, bodyHtml: string, tone: Tone = 'info') {
    const styles = this.getToneStyles(tone)

    return `
      <div
        style="
          margin:0 0 14px 0;
          padding:16px;
          border:1px solid ${this.colors.border};
          border-radius:16px;
          background:linear-gradient(180deg,#ffffff,${styles.soft});
        "
      >
        <div style="margin:0 0 12px 0;">
          <p
            style="
              margin:0;
              color:${styles.accent};
              font-size:12px;
              font-weight:800;
              text-transform:uppercase;
              letter-spacing:.08em;
            "
          >
            ${this.escapeHtml(title)}
          </p>
        </div>
        <div style="font-size:14px; line-height:1.7; color:${this.colors.text};">
          ${bodyHtml}
        </div>
      </div>
    `
  }

  private buildDetailRows(rows: Array<{ label: string; value: string }>) {
    return `
      <div style="display:grid; gap:10px;">
        ${rows
          .map(
            (row) => `
              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  gap:16px;
                  padding:10px 12px;
                  border-radius:12px;
                  background:rgba(255,255,255,.88);
                  border:1px solid rgba(229,231,235,.95);
                "
              >
                <span style="font-size:13px; color:${this.colors.muted}; font-weight:600;">
                  ${this.escapeHtml(row.label)}
                </span>
                <span style="font-size:13px; color:${this.colors.text}; font-weight:700; text-align:right;">
                  ${this.escapeHtml(row.value)}
                </span>
              </div>
            `,
          )
          .join('')}
      </div>
    `
  }

  private buildFeeBox() {
    return `
      <div
        style="
          margin-top:14px;
          padding:22px 20px;
          text-align:center;
          border-radius:18px;
          border:1px solid rgba(193,154,61,0.24);
          background:linear-gradient(180deg,rgba(255,255,255,0.98),rgba(193,154,61,0.10));
          box-shadow:0 10px 22px rgba(193,154,61,0.12);
        "
      >
        <span
          style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding:7px 12px;
            border-radius:999px;
            background:rgba(193,154,61,0.14);
            color:${this.colors.gold};
            font-size:11px;
            font-weight:800;
            letter-spacing:.08em;
            text-transform:uppercase;
            margin-bottom:14px;
            border:1px solid rgba(193,154,61,0.18);
          "
        >
          Cuota de inscripción
        </span>

        <p
          style="
            margin:0 0 14px 0;
            font-size:22px;
            line-height:.95;
            letter-spacing:-0.07em;
            color:#000000;
            font-weight:900;
            text-align:center;
          "
        >
          ₡5,000
        </p>

        <div
          style="
            display:block;
            margin:16px auto 14px auto;
            max-width:260px;
            padding:12px 14px;
            border-radius:16px;
            text-align:center;
            background:rgba(255,255,255,0.92);
            border:1px solid rgba(193,154,61,0.20);
          "
        >
          <div
            style="
              font-size:11px;
              font-weight:800;
              letter-spacing:.08em;
              text-transform:uppercase;
              color:${this.colors.muted};
              margin-bottom:5px;
            "
          >
            SINPE Móvil
          </div>
          <div
            style="
              font-size:22px;
              line-height:1;
              letter-spacing:-0.03em;
              font-weight:800;
              color:${this.colors.gold};
            "
          >
            8501 1152
          </div>
        </div>

        <p
          style="
            margin:0;
            color:${this.colors.text};
            font-size:14px;
            line-height:1.7;
            text-align:center;
          "
        >
          Puede cancelar por SINPE Móvil. En el detalle agregue su número de cédula y luego envíe el comprobante.
        </p>
      </div>
    `
  }

  private buildList(items: string[]) {
    return `
      <ul style="margin:0; padding-left:18px; color:${this.colors.text};">
        ${items.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('')}
      </ul>
    `
  }

  private buildLayout(params: {
    eyebrow: string
    title: string
    subtitle: string
    greeting?: string
    intro: string
    tone?: Tone
    buttonLabel?: string
    buttonLink?: string
    sectionHtml?: string
    noteHtml?: string
    footerTitle?: string
    footerSubtitle?: string
  }) {
    const tone = params.tone ?? 'info'
    const styles = this.getToneStyles(tone)

    const greeting = params.greeting
      ? `<p style="margin:0 0 14px 0; font-size:15px; font-weight:600; color:${this.colors.text};">${this.escapeHtml(params.greeting)}</p>`
      : ''

    const button =
      params.buttonLabel && params.buttonLink
        ? this.buildButton(params.buttonLabel, params.buttonLink, tone)
        : ''

    const fallbackLink =
      params.buttonLink
        ? `
          <p style="margin:10px 0 0 0; font-size:13px; color:${this.colors.muted}; word-break:break-word;">
            Si el botón no funciona, copie y pegue este enlace en su navegador:<br/>
            <span style="color:${styles.accent};">${this.escapeHtml(params.buttonLink)}</span>
          </p>
        `
        : ''

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${this.escapeHtml(params.title)}</title>
      </head>
      <body style="margin:0; padding:0; background:${this.colors.bg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${this.colors.bg}; padding:18px 14px;">
          <tr>
            <td align="center">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width:600px;
                  background:${this.colors.surface};
                  border:1px solid #E6E9EE;
                  border-radius:20px;
                  overflow:hidden;
                  box-shadow:0 8px 22px rgba(15,23,42,0.06);
                "
              >
                <tr>
                  <td style="padding:28px 30px 18px 30px; text-align:left; border-bottom:1px solid #F1F3F5;">
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 18px 0;">
                      <tr>
                        <td style="vertical-align:middle;">
                          <div
                            style="
                              width:56px;
                              height:56px;
                              border-radius:16px;
                              background:#ffffff;
                              border:1px solid ${this.colors.border};
                              box-shadow:0 4px 14px rgba(15,23,42,0.04);
                              text-align:center;
                              line-height:56px;
                              overflow:hidden;
                            "
                          >
                            <img
                              src="${this.logoUrl}"
                              alt="Logo Cámara de Ganaderos"
                              style="width:34px; height:34px; object-fit:contain; vertical-align:middle;"
                            />
                          </div>
                        </td>
                        <td style="padding-left:14px; vertical-align:middle;">
                          <p style="margin:0 0 3px 0; font-size:15px; font-weight:700; color:${this.colors.text};">
                            Cámara de Ganaderos de Hojancha
                          </p>
                          <p style="margin:0; font-size:13px; color:${this.colors.muted};">
                            ${this.escapeHtml(params.footerSubtitle ?? 'Notificación automática')}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <span
                      style="
                        display:inline-block;
                        padding:7px 11px;
                        border-radius:999px;
                        background:${styles.soft};
                        color:${styles.accent};
                        border:1px solid ${styles.soft};
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:.08em;
                        text-transform:uppercase;
                      "
                    >
                      ${this.escapeHtml(params.eyebrow)}
                    </span>

                    <h1
                      style="
                        margin:14px 0 8px 0;
                        font-size:30px;
                        line-height:1.14;
                        letter-spacing:-0.04em;
                        font-weight:700;
                        color:#111827;
                      "
                    >
                      ${this.escapeHtml(params.title)}
                    </h1>

                    <p style="margin:0; color:${this.colors.muted}; font-size:13px;">
                      ${this.escapeHtml(params.subtitle)}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 30px 30px 30px; font-size:15px; line-height:1.7; color:${this.colors.text};">
                    ${greeting}

                    <p style="margin:0 0 22px 0; color:#374151;">
                      ${this.escapeHtml(params.intro)}
                    </p>

                    ${button}
                    ${params.sectionHtml ?? ''}
                    ${params.noteHtml ?? ''}
                    ${fallbackLink}
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 30px; background:#FBFBFC; border-top:1px solid ${this.colors.border};">
                    <p style="margin:0 0 4px 0; font-weight:700; font-size:13px; color:${this.colors.text};">
                      ${this.escapeHtml(params.footerTitle ?? 'Cámara de Ganaderos de Hojancha')}
                    </p>
                    <p style="margin:0 0 8px 0; font-size:13px; color:${this.colors.muted};">
                      ${this.escapeHtml(params.footerSubtitle ?? 'Notificación automática')}
                    </p>
                    <p style="margin:0; font-size:12px; color:#9CA3AF;">
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
  }

  private async sendEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    const email: Brevo.SendSmtpEmail = {
      sender: this.sender,
      to: this.toRecipients(to),
      subject,
      htmlContent,
    }

    try {
      await this.apiInstance.sendTransacEmail(email)
      this.logger.log(`✅ Correo enviado: ${subject}`)
    } catch (e: any) {
      this.logger.error('❌ Error enviando email', e?.response?.body || e)
      throw e
    }
  }

  //RESTABLECER CONTRASEÑA

  async sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
    const html = this.buildLayout({
      eyebrow: 'Seguridad de cuenta',
      title: 'Restablece tu contraseña',
      subtitle: 'Usa el siguiente enlace para completar el proceso.',
      greeting: 'Hola,',
      intro:
        'Recibimos una solicitud para restablecer tu contraseña. Para continuar, utiliza el siguiente botón.',
      buttonLabel: 'Restablecer contraseña',
      buttonLink: resetLink,
      sectionHtml: this.buildPanel(
        'Importante',
        `<p style="margin:0;">Si no solicitaste este cambio, puedes ignorar este mensaje. El enlace expirará en <strong>24 horas</strong>.</p>`,
        'info',
      ),
      footerTitle: 'Cámara de Ganaderos de Hojancha',
      footerSubtitle: 'Seguridad y Configuración',
      tone: 'info',
    })

    await this.sendEmail(to, 'Restablece tu contraseña', html)
  }

  //CONFIRMAR CAMBIO DE CORREO

  async sendConfirmEmailChange(
    to: string,
    confirmLink: string,
  ): Promise<void> {
    const html = this.buildLayout({
      eyebrow: 'Confirmar correo',
      title: 'Confirma tu nuevo correo',
      subtitle: 'Usa el siguiente enlace para validar este cambio.',
      greeting: 'Hola,',
      intro:
        'Se solicitó actualizar el correo asociado a tu cuenta. Para confirmar que este correo te pertenece, haz clic en el siguiente botón.',
      buttonLabel: 'Confirmar correo',
      buttonLink: confirmLink,
      sectionHtml: this.buildPanel(
        'Seguridad',
        `<p style="margin:0;">Si no solicitaste este cambio, puedes ignorar este mensaje. El enlace expirará en <strong>24 horas</strong>.</p>`,
        'success',
      ),
      footerTitle: 'Cámara de Ganaderos de Hojancha',
      footerSubtitle: 'Seguridad y Configuración',
      tone: 'success',
    })

    await this.sendEmail(to, 'Confirma tu nuevo correo', html)
  }

  //NOTIFICACIÓN NUEVA SOLICITUD ASOCIADO - SOLICITANTE

  async sendAssociateApplicationReceivedEmail(
    to: string,
    name?: string,
  ): Promise<void> {
    const safeName = name?.trim() || 'solicitante'

    const html = this.buildLayout({
      eyebrow: 'Solicitud recibida',
      title: 'Recibimos tu solicitud de asociado',
      subtitle: 'Tu información ya fue registrada correctamente en nuestro sistema.',
      greeting: `Hola ${safeName},`,
      intro:
        'Tu solicitud fue recibida correctamente y ya se encuentra en revisión por nuestro equipo.',
      sectionHtml: this.buildPanel(
        '¿Qué sigue?',
        this.buildList([
          'Revisaremos la información enviada.',
          'Si necesitamos algo adicional, nos comunicaremos contigo.',
          'Recibirás un correo cuando tu solicitud sea aprobada o rechazada.',
        ]),
        'success',
      ),
      noteHtml: this.buildPanel(
        'Fecha de recepción',
        `<p style="margin:0;">${this.escapeHtml(this.formatNowCostaRica())}</p>`,
        'info',
      ),
      footerTitle: 'Departamento de Asociados',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'success',
    })

    await this.sendEmail(to, 'Hemos recibido tu solicitud de asociado', html)
  }

  //NOTIFICACIÓN NUEVA SOLICITUD ASOCIADO - EQUIPO

  async sendNewAssociateApplicationNotificationEmail(
    payload: InternalNotificationPayload,
  ): Promise<void> {
    const html = this.buildLayout({
      eyebrow: 'Nueva solicitud',
      title: 'Nueva solicitud de asociado',
      subtitle: 'Se generó un nuevo registro en el módulo de asociados.',
      greeting: 'Hola equipo,',
      intro: 'Se registró una nueva solicitud de asociado en el sistema.',
      sectionHtml: this.buildPanel(
        'Datos del solicitante',
        this.buildDetailRows([
          { label: 'Nombre', value: payload.applicantName || 'Sin nombre' },
          { label: 'Correo', value: payload.applicantEmail || 'Sin correo' },
          { label: 'Cédula', value: payload.applicantId || 'No indicada' },
        ]),
        'warning',
      ),
      noteHtml: this.buildPanel(
        'Registro',
        `<p style="margin:0;">Fecha y hora: ${this.escapeHtml(this.formatNowCostaRica())}</p>`,
        'info',
      ),
      footerTitle: 'Sistema de Asociados',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'warning',
    })

    await this.sendEmail(
      this.associatesNotificationTo,
      'Nueva solicitud de asociado',
      html,
    )
  }

  //SOLICITUDES VOLUNTARIADO RECIBIDAS - SOLICITANTE

  async sendVolunteerApplicationReceivedEmail(
    to: string,
    nombre: string,
    tipoSolicitante: string,
  ): Promise<void> {
    const safeName = nombre?.trim() || 'solicitante'
    const tipoTexto =
      tipoSolicitante === 'INDIVIDUAL'
        ? 'Voluntario individual'
        : 'Organización voluntaria'

    const html = this.buildLayout({
      eyebrow: 'Solicitud recibida',
      title: 'Recibimos tu solicitud de voluntariado',
      subtitle: 'Tu solicitud ya ingresó al proceso de revisión.',
      greeting: `Hola ${safeName},`,
      intro:
        'Tu solicitud de voluntariado fue recibida correctamente y ya se encuentra en proceso de revisión.',
      sectionHtml: this.buildPanel(
        '¿Qué sigue?',
        this.buildList([
          'Revisaremos la información enviada.',
          'Podríamos contactarte si necesitamos datos adicionales.',
          'Te notificaremos por correo cuando exista una resolución.',
        ]),
        'success',
      ),
      noteHtml: this.buildPanel(
        'Tipo de solicitud',
        `<p style="margin:0;">${this.escapeHtml(tipoTexto)}</p>`,
        'info',
      ),
      footerTitle: 'Equipo de Voluntariado',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'success',
    })

    await this.sendEmail(
      to,
      'Hemos recibido tu solicitud de voluntariado',
      html,
    )
  }

  //NOTIFICACIÓN NUEVA SOLICITUD VOLUNTARIADO - EQUIPO

  async sendNewVolunteerApplicationNotificationEmail(
    payload: InternalNotificationPayload,
  ): Promise<void> {
    const html = this.buildLayout({
      eyebrow: 'Nueva solicitud',
      title: 'Nueva solicitud de voluntariado',
      subtitle: 'Se generó un nuevo registro en el módulo de voluntariado.',
      greeting: 'Hola equipo,',
      intro: 'Se registró una nueva solicitud de voluntariado en el sistema.',
      sectionHtml: this.buildPanel(
        'Datos del solicitante',
        this.buildDetailRows([
          { label: 'Tipo', value: payload.tipoSolicitante || 'No indicado' },
          { label: 'Nombre', value: payload.applicantName || 'Sin nombre' },
          { label: 'Correo', value: payload.applicantEmail || 'Sin correo' },
          {
            label: 'Identificación',
            value: payload.applicantId || 'No indicada',
          },
        ]),
        'warning',
      ),
      noteHtml: this.buildPanel(
        'Registro',
        `<p style="margin:0;">Fecha y hora: ${this.escapeHtml(this.formatNowCostaRica())}</p>`,
        'info',
      ),
      footerTitle: 'Sistema de Voluntariado',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'warning',
    })

    await this.sendEmail(
      this.volunteersNotificationTo,
      'Nueva solicitud de voluntariado',
      html,
    )
  }

  //APROBADO ASOCIADOS

  async sendApplicationApprovedEmailAssociates(
    to: string,
    name?: string,
  ): Promise<void> {
    const safeName = name?.trim() || 'solicitante'

    const html = this.buildLayout({
      eyebrow: 'Solicitud aprobada',
      title: 'Tu solicitud fue aprobada',
      subtitle: 'Ya puedes continuar con el siguiente paso del proceso.',
      greeting: `Hola ${safeName},`,
      intro: 'Tu solicitud para ser asociado(a) ha sido aprobada exitosamente.',
      sectionHtml: this.buildPanel(
        'Información importante',
        `
          <p style="margin:0 0 10px 0;">
            Por favor preséntate o contacta a la <strong>Cámara de Ganaderos de Hojancha</strong>
            para completar tu registro.
          </p>
          ${this.buildFeeBox()}
        `,
        'warning',
      ),
      footerTitle: 'Departamento de Asociados',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'warning',
    })

    await this.sendEmail(to, 'Solicitud de asociado aprobada', html)
  }

  //APROBADO VOLUNTARIOS

  async sendApplicationApprovalEmailVolunteers(
    to: string,
    nombre: string,
    tipoSolicitante: string,
  ): Promise<void> {
    const safeName = nombre?.trim() || 'solicitante'

    const html = this.buildLayout({
      eyebrow: 'Solicitud aprobada',
      title: 'Tu solicitud fue aprobada',
      subtitle:
        'Ya formas parte del siguiente paso del proceso de voluntariado.',
      greeting: `Hola ${safeName},`,
      intro:
        'Nos complace informarte que tu solicitud de voluntariado ha sido aprobada exitosamente.',
      sectionHtml: this.buildPanel(
        'Próximos pasos',
        this.buildList([
          'Nos pondremos en contacto en los próximos días.',
          'Recibirás información sobre orientación inicial.',
          'Te compartiremos el cronograma de actividades.',
        ]),
        'success',
      ),
      noteHtml: this.buildPanel(
        'Gracias',
        `<p style="margin:0;">Agradecemos mucho tu interés en apoyar a nuestra organización.</p>`,
        'info',
      ),
      footerTitle: 'Equipo de Voluntariado',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'success',
    })

    await this.sendEmail(to, 'Solicitud de voluntariado aprobada', html)
  }

  //SOLICITUDES RECHAZADAS ASOCIADOS

  async sendApplicationRejectionEmailAssociates(
    to: string,
    name?: string,
    reason?: string,
  ): Promise<void> {
    const safeName = name?.trim() || 'solicitante'
    const safeReason = reason?.trim() || 'No especificado'

    const html = this.buildLayout({
      eyebrow: 'Solicitud rechazada',
      title: 'Actualización de tu solicitud',
      subtitle: 'Queremos informarte el resultado de la revisión realizada.',
      greeting: `Hola ${safeName},`,
      intro:
        'Lamentamos informarte que tu solicitud de asociación no ha sido aprobada en esta ocasión.',
      sectionHtml: this.buildPanel(
        'Motivo',
        `<p style="margin:0;">${this.escapeHtml(safeReason)}</p>`,
        'danger',
      ),
      noteHtml: this.buildPanel(
        'Información',
        `<p style="margin:0;">Si deseas más información, puedes comunicarte con la organización por los medios oficiales.</p>`,
        'info',
      ),
      footerTitle: 'Departamento de Asociados',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'danger',
    })

    await this.sendEmail(to, 'Solicitud de asociado rechazada', html)
  }

  //RECHAZADO VOLUNTARIOS

  async sendApplicationRejectionEmailVolunteers(
    to: string,
    nombre: string,
    motivo: string,
    tipoSolicitante: string,
  ): Promise<void> {
    const safeName = nombre?.trim() || 'solicitante'
    const safeReason = motivo?.trim() || 'No especificado'

    const html = this.buildLayout({
      eyebrow: 'Solicitud rechazada',
      title: 'Actualización de tu solicitud',
      subtitle: 'Ya tenemos una resolución sobre tu solicitud de voluntariado.',
      greeting: `Hola ${safeName},`,
      intro:
        'Gracias por tu interés en formar parte de nuestro programa de voluntariado. Después de revisar cuidadosamente tu solicitud, en esta ocasión no ha sido aprobada.',
      sectionHtml: this.buildPanel(
        'Motivo',
        `<p style="margin:0;">${this.escapeHtml(safeReason)}</p>`,
        'danger',
      ),
      noteHtml: this.buildPanel(
        'Agradecimiento',
        `<p style="margin:0;">Valoramos tu interés y el tiempo que dedicaste a completar el formulario.</p>`,
        'info',
      ),
      footerTitle: 'Equipo de Voluntariado',
      footerSubtitle: 'Cámara de Ganaderos de Hojancha',
      tone: 'danger',
    })

    await this.sendEmail(to, 'Solicitud de voluntariado rechazada', html)
  }
}