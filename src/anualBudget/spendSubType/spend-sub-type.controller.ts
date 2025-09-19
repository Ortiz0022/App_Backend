import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SpendSubTypeService } from './spend-sub-type.service';
import { CreateSpendSubTypeDto } from './dto/createSpendSubTypeDto';
import { UpdateSpendSubTypeDto } from './dto/updateSpendSubTypeDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('spend-sub-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpendSubTypeController {
  constructor(private readonly svc: SpendSubTypeService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateSpendSubTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('spendTypeId') spendTypeId?: number) {
    return this.svc.findAll(spendTypeId ? Number(spendTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpendSubTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
