// src/anualBudget/incomeTypeByDeparment/income-type-by-department.controller.ts
import { Controller, Post, Param, Get } from '@nestjs/common';
import { IncomeTypeByDepartmentService } from './income-type-by-department.service';

@Controller('income-type-by-department')
export class IncomeTypeByDepartmentController {
  constructor(private readonly svc: IncomeTypeByDepartmentService) {}

  @Post('recalc/:Id_Department')
  recalcOne(@Param('Id_Department') id: string) {
    return this.svc.recalcDepartmentTotal(+id);
  }

  @Post('recalc-all')
  recalcAll() {
    return this.svc.recalcAll();
  }
}
