import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSpendRegisterDto } from './dto/createSpendRegisterDto';
import { UpdateSpendRegisterDto } from './dto/updateSpendRegisterDto';
import { Category } from '../category/entities/category.entity';
import { SpendRegister } from './entities/spendRegister.entity';

@Injectable()
export class SpendRegisterService {
  constructor(
    @InjectRepository(SpendRegister) private repo: Repository<SpendRegister>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateSpendRegisterDto) {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const entity = this.repo.create({
      date: dto.date ? new Date(dto.date) : new Date(),
      description: dto.description,
      sub_total: dto.sub_total,
      voucher: dto.voucher,
      category,
    });

    return this.repo.save(entity);
  }

  // opcional: filtra por categoryId
  findAll(categoryId?: number) {
    if (categoryId) {
      return this.repo.find({
        where: { category: { id: categoryId } },
        relations: ['category'],
        order: { date: 'DESC', id: 'DESC' },
      });
    }
    return this.repo.find({ relations: ['category'], order: { date: 'DESC', id: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!row) throw new NotFoundException('Spend not found');
    return row;
  }

  async update(id: number, dto: UpdateSpendRegisterDto) {
    const row = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!row) throw new NotFoundException('Spend not found');

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      row.category = category;
    }

    // asignación simple
    if (dto.date !== undefined) row.date = new Date(dto.date);
    if (dto.description !== undefined) row.description = dto.description;
    if (dto.sub_total !== undefined) row.sub_total = dto.sub_total;
    if (dto.voucher !== undefined) row.voucher = dto.voucher;

    return this.repo.save(row);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Spend not found');
    await this.repo.delete(id);
  }
}
