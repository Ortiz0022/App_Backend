import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Projection } from './entities/projection.entity';
import { UpdateProjectionDto } from './dto/updateProjectionDto';
import { Category } from '../category/entities/category.entity';
import { CreateProjectionDto } from './dto/createProjectionDto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Projection) private repo: Repository<Projection>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  create(dto: CreateProjectionDto) {
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
    if (!b) throw new NotFoundException('projection not found');
    return b;
  }

  async update(id: number, dto: UpdateProjectionDto) {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException('projection not found');

    Object.assign(b, dto);

    return this.repo.save(b);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('projection not found');
    await this.repo.delete(id);
  }

  // ========= NUEVO: asignar monto a una category y recalcular total =========
  async setCategoryAmount(projectionId: number, categoryId: number, amount: string) {
    // 1) Verificar projection
    const projection = await this.repo.findOne({ where: { id: projectionId } });
    if (!projection) throw new NotFoundException('projection not found');

    // 2) Buscar category que pertenezca a ese projection
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, projection: { id: projectionId } },
      relations: ['projection'],
    });
    if (!category) throw new NotFoundException('Category not found for this projection');

    // 3) Actualizar monto de la category
    category.category_amount = amount;
    await this.categoryRepo.save(category);

    // 4) Recalcular total del projection = SUM(category_amount)
  const raw = await this.categoryRepo
  .createQueryBuilder('c')
  .select('COALESCE(SUM(c.category_amount), 0)', 'sum')
  .where('c.projectionId = :projectionId', { projectionId }) // <= AQUÍ
  .getRawOne<{ sum: string }>();

const sum = raw?.sum ?? '0';
projection.total_amount = sum;
await this.repo.save(projection);

    return { category, projection: projection };
  }
}
