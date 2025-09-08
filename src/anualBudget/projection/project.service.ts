import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projection } from './entities/projection.entity';
import { UpdateProjectionDto } from './dto/updateProjectionDto';
import { Category } from '../category/entities/category.entity';
import { CreateProjectionDto } from './dto/createProjectionDto';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Projection) private repo: Repository<Projection>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(FiscalYear) private fyRepo: Repository<FiscalYear>,
  ) {}

  async create(dto: CreateProjectionDto) {
    const fy = await this.fyRepo.findOne({ where: { id: dto.fiscalYearId } });
    if (!fy) throw new NotFoundException('fiscal year not found');

    const entity = this.repo.create({
      fiscalYear: fy,
      total_amount: dto.total_amount ?? undefined,
    });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  findByFiscalYearId(fiscalYearId: number) {
    return this.repo.find({
      where: { fiscalYear: { id: fiscalYearId } },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('projection not found');
    return row;
  }

  async update(id: number, dto: UpdateProjectionDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('projection not found');
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('projection not found');
    const res = await this.repo.delete(id);
    return { deleted: !!res.affected };
  }

  async setCategoryAmount(projectionId: number, categoryId: number, amount: string) {
    const projection = await this.repo.findOne({ where: { id: projectionId } });
    if (!projection) throw new NotFoundException('projection not found');

    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, projection: { id: projectionId } },
      relations: ['projection'],
    });
    if (!category) throw new NotFoundException('Category not found for this projection');

    category.category_amount = amount;
    await this.categoryRepo.save(category);

    const raw = await this.categoryRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.category_amount), 0)', 'sum')
      .where('c.projectionId = :projectionId', { projectionId })
      .getRawOne<{ sum: string }>();

    const sum = raw?.sum ?? '0';
    projection.total_amount = sum;
    await this.repo.save(projection);

    return { category, projection };
  }
}
