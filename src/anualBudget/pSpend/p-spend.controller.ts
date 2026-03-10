import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';

import { CreatePSpendDto } from './dto/create.dto';
import { UpdatePSpendDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { PSpendService } from './p-spend.services';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { CurrentUserData } from 'src/auth/current-user.interface';

@Controller('p-spend')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PSpendController {
  constructor(private readonly svc: PSpendService) {}

  @Post()
  @Roles('ADMIN')
  create(
    @Body() dto: CreatePSpendDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.svc.create(dto, currentUser);
  }

  @Get()
  list(
    @Query('subTypeId') subTypeId?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
  ) {
    return this.svc.findAll(
      subTypeId ? Number(subTypeId) : undefined,
      fiscalYearId ? Number(fiscalYearId) : undefined,
    );
  }

  @Get(':id')
  one(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePSpendDto,
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