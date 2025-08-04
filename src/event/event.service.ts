import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventDto } from './dto/EventDto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  findAllEvents() {
    return this.eventRepository.find();
  }

  findOneEvent(id: number) {
    return this.eventRepository.findOneBy({ id });
  }

  async createEvent(eventDto: EventDto) {
    const newEvent = this.eventRepository.create(eventDto);
    await this.eventRepository.save(newEvent);
    return newEvent;
  }

  deleteEvent(id: number) {
    return this.eventRepository.delete(id);
  }

  updateEvent(id: number, eventDto: EventDto) {
    return this.eventRepository.update(id, eventDto);
  }
}
