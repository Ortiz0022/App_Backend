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
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('registros-productivos')
export class RegistrosProductivosController {
  constructor(
    private readonly registrosProductivosService: RegistrosProductivosService,
  ) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateRegistrosProductivosDto) {
    return this.registrosProductivosService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.registrosProductivosService.findAll();
  }

  @Get('estadisticas')
  @Roles('ADMIN','JUNTA')
  getEstadisticas() {
    return this.registrosProductivosService.getEstadisticas();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registrosProductivosService.findOne(id);
  }

  @Get('finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.registrosProductivosService.findByFinca(idFinca);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRegistrosProductivosDto,
  ) {
    return this.registrosProductivosService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.registrosProductivosService.remove(id);
  }
}