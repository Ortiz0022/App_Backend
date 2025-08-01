import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { PersonalDto } from './dto/PersonalDto';

@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Post()
  create(@Body() createPersonalDto: PersonalDto) {
    return this.personalService.createPersonal(createPersonalDto);
  }

  @Get()
  findAll() {
    return this.personalService.findAllPersonal();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.personalService.findOnePersonal(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updatePersonalDto: PersonalDto) {
    return this.personalService.updatePersonal(id, updatePersonalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.personalService.deletePersonal(id);
  }
}
