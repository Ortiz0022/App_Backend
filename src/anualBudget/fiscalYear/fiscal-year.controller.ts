
import { FiscalYearService } from './fiscal-year.service';
import { CreateFiscalYearDto } from './dto/createFiscalYearDto';
import { FiscalYear } from './entities/fiscal-year.entity';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

@Controller('fiscal-year')
export class FiscalYearController {
  constructor(private readonly service: FiscalYearService) {}

  // Crear un año fiscal
  @Post()
  create(@Body() dto: CreateFiscalYearDto): Promise<FiscalYear> {
    return this.service.create(dto);
  }

  // Listar todos los años fiscales
  @Get()
  findAll(): Promise<FiscalYear[]> {
    return this.service.findAll();
  }

  // Obtener un año fiscal por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FiscalYear> {
    return this.service.findOne(id);
  }

  // Actualizar parcialmente un año fiscal
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() partial: Partial<FiscalYear>,
  ): Promise<FiscalYear> {
    return this.service.update(id, partial);
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: boolean }> {
    return this.service.remove(id);
}

}
