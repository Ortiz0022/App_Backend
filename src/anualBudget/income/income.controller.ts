import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/createIncomeDto';
import { UpdateIncomeDto } from './dto/updateIncomeDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { CurrentUserData } from 'src/auth/current-user.interface';

@Controller('income')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncomeController {
  constructor(private readonly svc: IncomeService) {}

  @Post()
  @Roles('ADMIN')
  create(
    @Body() dto: CreateIncomeDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.svc.create(dto, currentUser);
  }

  @Get()
  list(@Query('incomeSubTypeId') incomeSubTypeId?: string) {
    return this.svc.findAll(incomeSubTypeId ? Number(incomeSubTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncomeDto,
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