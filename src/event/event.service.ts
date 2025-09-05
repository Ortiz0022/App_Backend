import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventDto } from './dto/EventDto';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private readonly rt: RealtimeGateway,
  ) {}

  findAllEvents() {
    return this.eventRepository.find();
  }

  findOneEvent(id: number) {
    return this.eventRepository.findOneBy({ id });
  }

  async createEvent(eventDto: EventDto) {
    const created = this.eventRepository.create(eventDto);
    await this.eventRepository.save(created);
    this.rt.emitEventUpdated({ action: 'created', data: created });
    return created; 
  }

  async deleteEvent(id: number) {
    const idNum = Number(id);
    await this.eventRepository.delete(idNum);
    this.rt.emitEventUpdated({ action: 'deleted', id: idNum });
    return { ok: true };
  }

  async updateEvent(id: number, eventDto: EventDto) {     
    const updated = await this.eventRepository.update(id, eventDto);
    this.rt.emitEventUpdated({ action: 'updated', data: updated });
    return updated;
  }
}
