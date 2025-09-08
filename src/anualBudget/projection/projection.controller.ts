import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';

import { UpdateProjectionDto } from './dto/updateProjectionDto';
import { SetCategoryAmountDto } from './dto/set-category-amount.dto';
import { CreateProjectionDto } from './dto/createProjectionDto';

@Controller('projection')
export class ProjectionController {
  constructor(private readonly service: ProjectService) {}

  @Post()
  create(@Body() dto: CreateProjectionDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ========= NUEVA RUTA: setear monto de category desde projection =========
  @Patch(':projectionId/category/:categoryId/amount')
  setCategoryAmount(
    @Param('projectionId', ParseIntPipe) projectionId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() body: SetCategoryAmountDto,
  ) {
    return this.service.setCategoryAmount(projectionId, categoryId, body.amount);
  }
}
