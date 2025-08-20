import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './jwt.constants';
import { User } from 'src/users/entities/user.entity';
import { RoleDto } from 'src/role/dto/RoleDto'; // Idealmente aquí debería ir la entidad Role, no el DTO
import { Role } from 'src/role/entities/role.entity';
import {EmailModule} from 'src/email/email.module'
import { EncoderService } from './encoder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EncoderService],
})
export class AuthModule {}
