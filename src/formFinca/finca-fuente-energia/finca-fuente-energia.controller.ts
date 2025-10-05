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
import { FincaFuenteEnergiaService } from './finca-fuente-energia.service';
import { CreateFincaFuenteEnergiaDto } from './dto/create-finca-fuente-energia.dto';
import { UpdateFincaFuenteEnergiaDto } from './dto/update-finca-fuente-energia.dto';

@Controller('fincas-fuentes-energia')
export class FincaFuenteEnergiaController {
  constructor(
    private readonly fincaFuenteEnergiaService: FincaFuenteEnergiaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateFincaFuenteEnergiaDto) {
    return this.fincaFuenteEnergiaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.fincaFuenteEnergiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fincaFuenteEnergiaService.findOne(id);
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.fincaFuenteEnergiaService.findByFinca(idFinca);
  }

  @Get('fuente-energia/:idFuenteEnergia')
  findByFuenteEnergia(
    @Param('idFuenteEnergia', ParseIntPipe) idFuenteEnergia: number,
  ) {
    return this.fincaFuenteEnergiaService.findByFuenteEnergia(idFuenteEnergia);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFincaFuenteEnergiaDto,
  ) {
    return this.fincaFuenteEnergiaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fincaFuenteEnergiaService.remove(id);
  }

  @Delete('finca/:idFinca/fuente/:idFuenteEnergia')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByFincaAndFuente(
    @Param('idFinca', ParseIntPipe) idFinca: number,
    @Param('idFuenteEnergia', ParseIntPipe) idFuenteEnergia: number,
  ) {
    return this.fincaFuenteEnergiaService.removeByFincaAndFuente(
      idFinca,
      idFuenteEnergia,
    );
  }
}