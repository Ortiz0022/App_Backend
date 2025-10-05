import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateTipoCercaDto } from './dto/create-tipo-cerca.dto';
import { UpdateTipoCercaDto } from './dto/update-tipo-cerca.dto';
import { TiposCercaService } from './tipo-cerca.service';

@Controller('tipos-cerca')
export class TiposCercaController {
  constructor(private readonly service: TiposCercaService) {}

  @Post()
  create(@Body() dto: CreateTipoCercaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoCercaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
