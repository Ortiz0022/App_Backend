import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ExtraordinaryService } from './extraordinary.service';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AllocateExtraordinaryDto } from './dto/allocateExtraordinaryDto';
import { AssignExtraordinaryDto } from './dto/assignExtraordinaryDto';

@Controller('extraordinary')
export class ExtraordinaryController {
  constructor(private readonly service: ExtraordinaryService) {}

  @Post()
  create(@Body() dto: CreateExtraordinaryDto) {
    return this.service.create(dto);
  }

  @Post('assign-to-income')
  assignToIncome(@Body() dto: AssignExtraordinaryDto) {
    return this.service.assignToIncome(dto);
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

  // Allocate/consume part of the extraordinary balance
  @Patch(':id/allocate')
  allocate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AllocateExtraordinaryDto,
  ) {
    return this.service.allocate(id, dto);
  }

  // Remaining balance (amount - used)
  @Get(':id/remaining')
  remaining(@Param('id', ParseIntPipe) id: number) {
    return this.service.remaining(id);
  }
}
