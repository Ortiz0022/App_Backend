import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter

  constructor() {
    // Crear transporter con envs
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465, // SSL en 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
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

    const mailOptions: nodemailer.SendMailOptions = {
      from,
      to,
      subject: 'Restablece tu contraseña',
      html,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      this.logger.log(`Email enviado a ${to}: ${info.messageId}`)
      return info
    } catch (err) {
      this.logger.error('Error enviando email de reset password', err as any)
      throw err
    }
  }
}
