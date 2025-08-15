import { Module } from '@nestjs/common';
import { PrincipalController } from './principal.controller';
import { PrincipalService } from './principal.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Principal } from './entities/principal.entity';
import { Event } from 'src/event/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Principal, Event])],
  controllers: [PrincipalController],
  providers: [PrincipalService],
})
export class PrincipalModule {}

