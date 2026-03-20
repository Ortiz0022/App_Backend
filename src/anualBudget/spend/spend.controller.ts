import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SpendService } from './spend.service';
import { CreateSpendDto } from './dto/createSpendDto';
import { UpdateSpendDto } from './dto/updateSpendDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { CurrentUserData } from 'src/auth/current-user.interface';

@Controller('spend')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpendController {
  constructor(private readonly svc: SpendService) {}

  @Post()
  @Roles('ADMIN')
  create(
    @Body() dto: CreateSpendDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.svc.create(dto, currentUser);
  }

  @Get()
  list(
    @Query('spendSubTypeId') spendSubTypeId?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
  ) {
    return this.svc.findAll(
      spendSubTypeId ? Number(spendSubTypeId) : undefined,
      fiscalYearId ? Number(fiscalYearId) : undefined,
    );
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpendDto,
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