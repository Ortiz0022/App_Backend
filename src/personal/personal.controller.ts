import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { PersonalDto } from './dto/PersonalDto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('personal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Post()
  @Roles('ADMIN')
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
  @Roles('ADMIN')
  update(@Param('id') id: number, @Body() updatePersonalDto: PersonalDto) {
    return this.personalService.updatePersonal(id, updatePersonalDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: number) {
    return this.personalService.deletePersonal(id);
  }
}
