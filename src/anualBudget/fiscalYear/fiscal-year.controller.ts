import { Body, Controller, Get, Param, ParseIntPipe, Post, Patch, Delete } from '@nestjs/common';
import { FiscalYearService } from './fiscal-year.service';
import { CreateFiscalYearDto } from './dto/createFiscalYearDto';
import { UpdateFiscalYearDto } from './dto/updateFiscalYearDto';

@Controller('fiscal-year') // 👈 esto define /fiscal-year
export class FiscalYearController {
  constructor(private readonly svc: FiscalYearService) {}

  @Post()
  create(@Body() dto: CreateFiscalYearDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFiscalYearDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
