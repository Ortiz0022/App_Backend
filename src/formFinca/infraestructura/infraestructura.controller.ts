import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateInfraestructuraDto } from './dto/create-infraestructura.dto';
import { UpdateInfraestructuraDto } from './dto/update-infraestructura.dto';
import { InfraestructurasService } from './infraestructura.service';

@Controller('infraestructuras')
export class InfraestructurasController {
  constructor(private readonly service: InfraestructurasService) {}

  @Post()
  create(@Body() dto: CreateInfraestructuraDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInfraestructuraDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
