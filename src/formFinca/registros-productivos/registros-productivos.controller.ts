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
import { RegistrosProductivosService } from './registros-productivos.service';
import { CreateRegistrosProductivosDto } from './dto/create-registros-productivos.dto';
import { UpdateRegistrosProductivosDto } from './dto/update-registros-productivos.dto';

@Controller('registros-productivos')
export class RegistrosProductivosController {
  constructor(
    private readonly registrosProductivosService: RegistrosProductivosService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateRegistrosProductivosDto) {
    return this.registrosProductivosService.create(createDto);
  }

  @Get()
  findAll() {
    return this.registrosProductivosService.findAll();
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.registrosProductivosService.getEstadisticas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registrosProductivosService.findOne(id);
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.registrosProductivosService.findByFinca(idFinca);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRegistrosProductivosDto,
  ) {
    return this.registrosProductivosService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registrosProductivosService.remove(id);
  }
}