import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincaService } from './finca.service';
import { FincaController } from './finca.controller';
import { Finca } from './entities/finca.entity';
import { AssociateModule } from 'src/formAssociates/associate/associate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finca]),
    forwardRef(() => AssociateModule) // ✅ Resolver dependencia circular
  ],
  controllers: [FincaController],
  providers: [FincaService],
  exports: [FincaService],
})
export class FincaModule {}