import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ExtraordinaryService } from './extraordinary.service';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AllocateExtraordinaryDto } from './dto/allocateExtraordinaryDto';
import { AssignExtraordinaryDto } from './dto/assignExtraordinaryDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('extraordinary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExtraordinaryController {
  constructor(private readonly service: ExtraordinaryService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateExtraordinaryDto) {
    return this.service.create(dto);
  }

  @Post('assign-to-income')
  @Roles('ADMIN')
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
  @Roles('ADMIN')
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
