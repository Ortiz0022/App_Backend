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
} from '@nestjs/common';
import { FincaEquipoService } from './finca-equipo.service';
import { CreateFincaEquipoDto } from './dto/create-finca-equipo.dto';
import { UpdateFincaEquipoDto } from './dto/update-finca-equipo.dto';

@Controller('fincas-equipos')
export class FincaEquipoController {
  constructor(private readonly fincaEquipoService: FincaEquipoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateFincaEquipoDto) {
    return this.fincaEquipoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.fincaEquipoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fincaEquipoService.findOne(id);
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.fincaEquipoService.findByFinca(idFinca);
  }

  @Get('equipo/:idEquipo')
  findByEquipo(@Param('idEquipo', ParseIntPipe) idEquipo: number) {
    return this.fincaEquipoService.findByEquipo(idEquipo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFincaEquipoDto,
  ) {
    return this.fincaEquipoService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fincaEquipoService.remove(id);
  }

  @Delete('finca/:idFinca/equipo/:idEquipo')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByFincaAndEquipo(
    @Param('idFinca', ParseIntPipe) idFinca: number,
    @Param('idEquipo', ParseIntPipe) idEquipo: number,
  ) {
    return this.fincaEquipoService.removeByFincaAndEquipo(idFinca, idEquipo);
  }
}