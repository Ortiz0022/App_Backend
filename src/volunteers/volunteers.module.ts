import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteers } from './entities/volunteers.entity';
import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Volunteers])],
  controllers: [VolunteersController],
  providers: [VolunteersService],
})
export class VolunteersModule {}
