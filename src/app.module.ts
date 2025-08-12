import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
    PrincipalModule, VolunteersModule, 
    PersonalModule, FaqModule, 
    AssociateModule, ServicesInformativeModule, 
    AboutUsModule, EventModule,
    UsersModule, RoleModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
