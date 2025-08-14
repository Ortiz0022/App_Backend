import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Principal } from 'src/principal/entities/principal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Principal])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
