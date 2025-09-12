// src/anualBudget/spendTypeByDepartment/spend-type-by-department.controller.ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SpendTypeByDepartmentService } from './spend-type-by-department.service';
import { CreateSpendTypeByDepartmentDto } from './dto/createSpendTypeByDto';


@Controller('spend-type-by-department')
export class SpendTypeByDepartmentController {
  constructor(private readonly svc: SpendTypeByDepartmentService) {}

  // Crea/asegura la fila TOTAL del depto y la calcula
  @Post()
  create(@Body() dto: CreateSpendTypeByDepartmentDto) {
    return this.svc.create(dto);
  }

  // Recalcula manualmente el total de un depto
  @Post('recalc/:departmentId')
  recalcOne(@Param('departmentId') id: string) {
    return this.svc.recalcDepartmentTotal(+id);
  }

  // Recalcula todos los departamentos
  @Post('recalc-all')
  recalcAll() {
    return this.svc.recalcAll();
  }

  // Obtiene el total por departamento
  @Get('department/:id')
  getByDepartment(@Param('id') id: string) {
    return this.svc.findByDepartment(+id);
  }

  // Lista todos los totales
  @Get()
  findAllTotals() {
    return this.svc.findAllTotals();
  }
}
