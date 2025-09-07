import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/createBudgetDto';
import { UpdateBudgetDto } from './dto/updateBudgetDto';
import { SetCategoryAmountDto } from './dto/set-category-amount.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  @Post()
  create(@Body() dto: CreateBudgetDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBudgetDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ========= NUEVA RUTA: setear monto de category desde budget =========
  @Patch(':budgetId/category/:categoryId/amount')
  setCategoryAmount(
    @Param('budgetId', ParseIntPipe) budgetId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() body: SetCategoryAmountDto,
  ) {
    return this.service.setCategoryAmount(budgetId, categoryId, body.amount);
  }
}
