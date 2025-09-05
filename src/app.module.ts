import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrincipalModule } from './principal/principal.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteersModule } from './volunteers/volunteers.module';
import { PersonalModule } from './personal/personal.module';
import { FaqModule } from './faq/faq.module';
import { AssociateModule } from './associates/associates.module';
import { ServicesInformativeModule } from './servicesInformative/servicesInformative.module';
import { AboutUsModule } from './aboutUs/aboutUs.module';
import { EventModule } from './event/event.module';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    // Throttler lo implementaremos luego como en los formularios 
    ThrottlerModule.forRoot([
      {
        name: 'login',    // política con nombre
        ttl: 120_000,     // ✅ 2 minutos en MILISEGUNDOS
        limit: 5,         // 5 intentos por ventana
      },
    ]),

    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123',
      database: 'cgh_database',
      autoLoadEntities: true,
      synchronize: true,
    }),

    // 👇 cada módulo es un elemento independiente del array
    RealtimeModule,
    PrincipalModule,
    VolunteersModule,
    PersonalModule,
    FaqModule,
    AssociateModule,
    ServicesInformativeModule,
    AboutUsModule,
    EventModule,
    UsersModule,
    RoleModule,    // ← aquí, sin .forRoot() y sin el objeto { ttl, limit } pegado
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}
