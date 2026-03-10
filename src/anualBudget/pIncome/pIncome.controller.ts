import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PIncomeService } from './pIncome.service';
import { UpdatePIncomeDto } from './dto/updatePIncomeDto';
import { CreatePIncomeDto } from './dto/createPIncomeDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { CurrentUserData } from 'src/auth/current-user.interface';

@Controller('p-income')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PIncomeController {
  constructor(private readonly svc: PIncomeService) {}

  @Post()
  @Roles('ADMIN')
  create(
    @Body() dto: CreatePIncomeDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.svc.create(dto, currentUser);
  }

  @Get()
  list(@Query('pIncomeSubTypeId') pIncomeSubTypeId?: number) {
    return this.svc.findAll(pIncomeSubTypeId ? Number(pIncomeSubTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePIncomeDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.svc.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.svc.remove(id, currentUser);
  }
}