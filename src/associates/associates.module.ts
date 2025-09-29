import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociatesService } from './associates.service';
import { AssociatesController } from './associates.controller';
import { Associate } from './entities/associate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Associate])],
  controllers: [AssociatesController],
  providers: [AssociatesService],
  exports: [AssociatesService],
})
export class AssociatesModule {}
