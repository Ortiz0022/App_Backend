import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { VoluntarioIndividualService } from './voluntario-individual.service';
import { CreateVoluntarioIndividualDto } from './dto/create-voluntario-individual.dto';
import { UpdateVoluntarioIndividualDto } from './dto/update-voluntario-individual.dto';
import { QueryVoluntarioIndividualDto } from './dto/query-voluntario-individual.dto';
import { Roles } from 'src/auth/roles.decorator';

@Controller('voluntarios-individuales')
export class VoluntarioIndividualController {
  constructor(
    private readonly voluntarioService: VoluntarioIndividualService,
  ) {}

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll(@Query() query: QueryVoluntarioIndividualDto) {
    return this.voluntarioService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN','JUNTA')
  getStats() {
    return this.voluntarioService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.findOne(id);
  }

  // Actualizar voluntario
  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoluntarioDto: UpdateVoluntarioIndividualDto,
  ) {
    return this.voluntarioService.update(id, updateVoluntarioDto);
  }

  //Toggle estado (activar/desactivar)
  @Patch(':id/toggle-status')
  @Roles('ADMIN')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.toggleStatus(id);
  }

  //Eliminar voluntario
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.remove(id);
  }
}