import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginAuth: LoginAuthDto) {
    return this.authService.login(loginAuth);
  }

  @Patch('request-reset-password')
  @HttpCode(204)
  requestResetPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto): Promise<void> {
    return this.authService.requestResetPassword(requestResetPasswordDto);
  }

  @Patch('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}