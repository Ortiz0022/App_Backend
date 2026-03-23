import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalService } from './personal.service';
import { PersonalController } from './personal.controller';
import { PersonalPdfService } from './pdf.service';
import { PersonaModule } from 'src/formAssociates/persona/persona.module';

@Module({
  imports: [TypeOrmModule.forFeature([Personal]), PersonaModule],
  controllers: [PersonalController],
  providers: [PersonalService, PersonalPdfService],
})
export class PersonalModule {}