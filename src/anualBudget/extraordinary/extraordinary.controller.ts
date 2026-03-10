import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ExtraordinaryService } from './extraordinary.service';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AllocateExtraordinaryDto } from './dto/allocateExtraordinaryDto';
import { AssignExtraordinaryDto } from './dto/assignExtraordinaryDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { CurrentUserData } from 'src/auth/current-user.interface';

@Controller('extraordinary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExtraordinaryController {
  constructor(private readonly service: ExtraordinaryService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateExtraordinaryDto, @CurrentUser() currentUser: CurrentUserData) {
    return this.service.create(dto, currentUser);
  }

  @Post('assign-to-income')
  @Roles('ADMIN')
  assignToIncome(@Body() dto: AssignExtraordinaryDto, @CurrentUser() currentUser: CurrentUserData) {
    return this.service.assignToIncome(dto, currentUser);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExtraordinaryDto , @CurrentUser() currentUser: CurrentUserData) {
    return this.service.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number , @CurrentUser() currentUser: CurrentUserData) {
    return this.service.remove(id, currentUser);
  }

  // Allocate/consume part of the extraordinary balance
  @Patch(':id/allocate')
  allocate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AllocateExtraordinaryDto,
    @CurrentUser() currentUser: CurrentUserData
   ) {
    return this.service.allocate(id, dto, currentUser);
  }

  // Remaining balance (amount - used)
  @Get(':id/remaining')
  remaining(@Param('id', ParseIntPipe) id: number) {
    return this.service.remaining(id);
  }
}
