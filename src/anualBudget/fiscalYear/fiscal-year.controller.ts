import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { FiscalYearService } from './fiscal-year.service';
import { CreateFiscalYearDto } from './dto/createFiscalYearDto';
import { UpdateFiscalYearDto } from './dto/updateFiscalYearDto';

@Controller('fiscal-year')
export class FiscalYearController {
  constructor(private readonly service: FiscalYearService) {}

  @Post() create(@Body() dto: CreateFiscalYearDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFiscalYearDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
