import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { EventService } from './event.service';
import { EventDto } from './dto/EventDto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Body() createEventDto: EventDto) {
    return this.eventService.createEvent(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAllEvents();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventService.findOneEvent(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateEventDto: EventDto) {
    return this.eventService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.eventService.deleteEvent(id);
  }
}
