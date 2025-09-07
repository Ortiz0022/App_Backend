import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Budget } from '../budget/entities/budget.entity';
import { CreateCategoryDto } from './dto/createCategoryDto';
import { UpdateCategoryDto } from './dto/updateCategoryDto';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private repo: Repository<Category>,
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const budget = await this.budgetRepo.findOne({ where: { id: dto.budgetId } });
    if (!budget) throw new NotFoundException('Budget not found');

    const entity = this.repo.create({
      name: dto.name,
      description: dto.description,
      category_amount: dto.category_amount ?? undefined, // default 0 en BD
      budget,
    });

    return this.repo.save(entity);
  }

  findAll(budgetId?: number) {
    if (budgetId) {
      return this.repo.find({
        where: { budget: { id: budgetId } },
        relations: ['budget'],
        order: { name: 'ASC' },
      });
    }
    return this.repo.find({ relations: ['budget'], order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['budget'] });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['budget'] });
    if (!cat) throw new NotFoundException('Category not found');

    Object.assign(cat, dto);

    return this.repo.save(cat);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');
    await this.repo.delete(id);
  }
}
