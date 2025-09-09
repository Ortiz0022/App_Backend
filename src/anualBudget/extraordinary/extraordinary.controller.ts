import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ExtraordinaryService } from './extraordinary.service';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AssignOneDto } from '../assing/dto/assingOneDto';

@Controller('extraordinary')
export class ExtraordinaryController {
  constructor(private readonly service: ExtraordinaryService) {}

  @Post()
  create(@Body() dto: CreateExtraordinaryDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExtraordinaryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // Asignar/actualizar UNA categoría
  @Post(':id/assign-one')
  assignOne(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignOneDto) {
    return this.service.assignOne(id, dto);
  }

  // Quitar asignación de UNA categoría
  @Delete(':id/assign-one/:categoryId')
  unassignOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.service.unassignOne(id, categoryId);
  }

}
