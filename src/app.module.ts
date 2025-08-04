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
    PrincipalModule, VolunteersModule, PersonalModule, FaqModule, AssociateModule, ServicesInformativeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
