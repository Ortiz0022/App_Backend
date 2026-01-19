import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { IncomeSubTypeService } from './income-sub-type.service';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';
import { FromPIncomeSubTypeDto } from './dto/fromPIncomeSubTypeDto';

@Controller('income-sub-type')
export class IncomeSubTypeController {
  constructor(private readonly svc: IncomeSubTypeService) {}

  @Post()
  create(@Body() dto: CreateIncomeSubTypeDto) {
    return this.svc.create(dto);
  }

  // GET /income-sub-type?incomeTypeId=5
  @Get()
  list(@Query('incomeTypeId') incomeTypeId?: string) {
    return this.svc.findAll(incomeTypeId ? Number(incomeTypeId) : undefined);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeSubTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  // (Opcional) Forzar recálculo del acumulado del SubType y su Type.
  // GET /income-sub-type/recalc/7
  @Get('recalc/:id')
  recalc(@Param('id', ParseIntPipe) id: number) {
    return this.svc.recalcAmount(id);
  }


  // POST /income-sub-type/from-projection
  @Post('from-projection')
  fromProjection(@Body() dto: FromPIncomeSubTypeDto) {
    return this.svc.fromProjectionSubType(dto.pIncomeSubTypeId);
  }
}
