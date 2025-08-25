import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

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

@Module({
  imports: [
    // ✅ Throttler BIEN colocado
    ThrottlerModule.forRoot([
      {
        ttl: 120_000, // 120s = 2 min (usa 300_000 para 5 min)
        limit: 5,
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
    AppService,
    // ✅ activa el rate‑limit global
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
