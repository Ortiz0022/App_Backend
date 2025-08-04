import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteerDto } from './dto/VolunteersDto';


@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  create(@Body() createVolunteerDto: VolunteerDto) {
    return this.volunteersService.createVolunteer(createVolunteerDto);
  }

  @Get()
  findAll() {
    return this.volunteersService.findAllVolunteers();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.volunteersService.findOneVolunteer(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateVolunteerDto: VolunteerDto) {
    return this.volunteersService.updateVolunteer(id, updateVolunteerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.volunteersService.deleteVolunteer(id);
  }
}
