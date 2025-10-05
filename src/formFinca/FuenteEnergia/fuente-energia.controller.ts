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
import { FuenteEnergiaService } from './fuente-energia.service';
import { CreateFuenteEnergiaDto } from './dto/create-fuente-energia.dto';
import { UpdateFuenteEnergiaDto } from './dto/update-fuente-energia.dto';

@Controller('fuentes-energia')
export class FuenteEnergiaController {
  constructor(private readonly fuenteEnergiaService: FuenteEnergiaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateFuenteEnergiaDto) {
    return this.fuenteEnergiaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.fuenteEnergiaService.findAll();
  }

  @Get('with-fincas-count')
  findAllWithFincasCount() {
    return this.fuenteEnergiaService.findAllWithFincasCount();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fuenteEnergiaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFuenteEnergiaDto,
  ) {
    return this.fuenteEnergiaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fuenteEnergiaService.remove(id);
  }
}