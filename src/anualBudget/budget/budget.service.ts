import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/createBudgetDto';
import { Budget } from './entities/budget.entity';
import { UpdateBudgetDto } from './dto/updateBudgetDto';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget) private repo: Repository<Budget>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  create(dto: CreateBudgetDto) {
    const entity = this.repo.create({
      year: dto.year,
      total_amount: dto.total_amount ?? undefined, // default 0 en BD
      state: dto.state ?? undefined,
    });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { year: 'DESC' } });
  }

  async findOne(id: number) {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Budget not found');
    return b;
  }

  async update(id: number, dto: UpdateBudgetDto) {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException('Budget not found');

    Object.assign(b, dto);

    return this.repo.save(b);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Budget not found');
    await this.repo.delete(id);
  }

  // ========= NUEVO: asignar monto a una category y recalcular total =========
  async setCategoryAmount(budgetId: number, categoryId: number, amount: string) {
    // 1) Verificar budget
    const budget = await this.repo.findOne({ where: { id: budgetId } });
    if (!budget) throw new NotFoundException('Budget not found');

    // 2) Buscar category que pertenezca a ese budget
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, budget: { id: budgetId } },
      relations: ['budget'],
    });
    if (!category) throw new NotFoundException('Category not found for this budget');

    // 3) Actualizar monto de la category
    category.category_amount = amount;
    await this.categoryRepo.save(category);

    // 4) Recalcular total del budget = SUM(category_amount)
  const { sum } = (await this.categoryRepo
    .createQueryBuilder('c')
    .select('COALESCE(SUM(c.category_amount), 0)', 'sum')
    .where('c.budgetId = :budgetId', { budgetId })
    .getRawOne<{ sum: string }>()) ?? { sum: '0' };

    budget.total_amount = sum;
    await this.repo.save(budget);

    return { category, budget };
  }
}
