import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';

@Controller('disponibilidades')
export class DisponibilidadController {
  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  @Get()
  findAll() {
    return this.disponibilidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidadService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisponibilidadDto: UpdateDisponibilidadDto,
  ) {
    return this.disponibilidadService.update(id, updateDisponibilidadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidadService.remove(id);
  }
}