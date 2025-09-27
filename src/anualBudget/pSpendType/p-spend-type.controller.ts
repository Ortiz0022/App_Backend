import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PSpendTypeService } from './p-spend-type.service';

@Controller('p-spend-type')
export class PSpendTypeController {
  constructor(private readonly svc: PSpendTypeService) {}

  @Get()
  list(
    @Query('departmentId') departmentId?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
  ) {
    return this.svc.findAll(
      departmentId ? Number(departmentId) : undefined,
      fiscalYearId ? Number(fiscalYearId) : undefined,
    );
  }

  @Post()
  create(@Body() dto: { name: string; departmentId: number }) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { name?: string; departmentId?: number },
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
