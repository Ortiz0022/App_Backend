import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Controller()
export class AppController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test-email')
  async testEmail() {
    await this.emailService.sendResetPasswordEmail(
      'camara.ganaderos.hojancha1985@gmail.com',
      'https://ejemplo.com/reset',
    );
    return 'Correo de prueba enviado';
  }
}
