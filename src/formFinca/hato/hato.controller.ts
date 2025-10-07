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
import { HatoService } from './hato.service';
import { CreateHatoDto } from './dto/create-hato.dto';
import { UpdateHatoDto } from './dto/update-hato.dto';

@Controller('hatos')
export class HatoController {
  constructor(private readonly hatoService: HatoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHatoDto) {
    return this.hatoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.hatoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hatoService.findOne(id);
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.hatoService.findByFinca(idFinca);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHatoDto,
  ) {
    return this.hatoService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hatoService.remove(id);
  }
}