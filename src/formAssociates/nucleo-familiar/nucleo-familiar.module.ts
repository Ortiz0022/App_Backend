import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NucleoFamiliarService } from './nucleo-familiar.service';
import { NucleoFamiliarController } from './nucleo-familiar.controller';
import { NucleoFamiliar } from './entities/nucleo-familiar.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NucleoFamiliar, Associate])],
  controllers: [NucleoFamiliarController],
  providers: [NucleoFamiliarService],
  exports: [NucleoFamiliarService],
})
export class NucleoFamiliarModule {}