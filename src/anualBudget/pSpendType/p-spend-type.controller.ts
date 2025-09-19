// src/anualBudget/pSpendType/p-spend-type.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
}
