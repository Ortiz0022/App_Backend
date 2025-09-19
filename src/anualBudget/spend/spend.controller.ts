import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SpendService } from './spend.service';
import { CreateSpendDto } from './dto/createSpendDto';
import { UpdateSpendDto } from './dto/updateSpendDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('spend')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpendController {
  constructor(private readonly svc: SpendService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateSpendDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query('spendSubTypeId') spendSubTypeId?: number) {
    return this.svc.findAll(spendSubTypeId ? Number(spendSubTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpendDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
