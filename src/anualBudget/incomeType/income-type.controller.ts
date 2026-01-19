import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { IncomeTypeService } from './income-type.service';
import { CreateIncomeTypeDto } from './dto/createIncomeTypeDto';
import { UpdateIncomeTypeDto } from './dto/updateIncomeTypeDto';
import { FromPIncomeTypeDto } from './dto/fromPIncomeTypeDto';

@Controller('income-type')
export class IncomeTypeController {
  constructor(private readonly svc: IncomeTypeService) {}

  @Post()
  create(@Body() dto: CreateIncomeTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  // (Opcional) Forzar recálculo del acumulado del Type desde sus SubTypes.
  // GET /income-type/recalc/3
  @Get('recalc/:id')
  recalc(@Param('id', ParseIntPipe) id: number) {
    return this.svc.recalcAmount(id);
  }



  @Post('from-projection')
  fromProjection(@Body() dto: FromPIncomeTypeDto) {
    return this.svc.fromProjectionType(dto.pIncomeTypeId);
  }
}
