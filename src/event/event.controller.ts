import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { EventService } from './event.service';
import { EventDto } from './dto/EventDto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createEventDto: EventDto) {
    return this.eventService.createEvent(createEventDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.eventService.findAllEvents();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventService.findOneEvent(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: number, @Body() updateEventDto: EventDto) {
    return this.eventService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: number) {
    return this.eventService.deleteEvent(id);
  }
}
