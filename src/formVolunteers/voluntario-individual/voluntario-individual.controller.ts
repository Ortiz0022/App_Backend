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

@Controller('voluntarios-individuales')
export class VoluntarioIndividualController {
  constructor(
    private readonly voluntarioService: VoluntarioIndividualService,
  ) {}

  // Listado con paginación y filtros
  @Get()
  findAll(@Query() query: QueryVoluntarioIndividualDto) {
    return this.voluntarioService.findAll(query);
  }

  // Estadísticas
  @Get('stats')
  getStats() {
    return this.voluntarioService.getStats();
  }

  // Detalle de un voluntario
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.findOne(id);
  }

  // Actualizar voluntario
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoluntarioDto: UpdateVoluntarioIndividualDto,
  ) {
    return this.voluntarioService.update(id, updateVoluntarioDto);
  }

  //Toggle estado (activar/desactivar)
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.toggleStatus(id);
  }

  //Eliminar voluntario
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.remove(id);
  }
}