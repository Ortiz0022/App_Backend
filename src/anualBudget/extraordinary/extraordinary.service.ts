import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AssignBudget } from '../assing/entities/assing.entity';
import { Category } from '../category/entities/category.entity';
import { Extraordinary } from './entities/extraordinary.entity';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AssignOneDto } from '../assing/dto/assingOneDto';
import { ProjectService } from '../projection/project.service';

@Injectable()
export class ExtraordinaryService {
  constructor(
    @InjectRepository(Extraordinary)
    private readonly extraordinaryRepo: Repository<Extraordinary>,
    @InjectRepository(AssignBudget)
    private readonly assignRepo: Repository<AssignBudget>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly dataSource: DataSource,
    private readonly projectService: ProjectService,
  ) {}

  async create(dto: CreateExtraordinaryDto) {
    const entity = this.extraordinaryRepo.create({
      extraordinaryAmount: dto.extraordinaryAmount,
      description: dto.description,
    });
    return this.extraordinaryRepo.save(entity);
  }

  findAll() {
    return this.extraordinaryRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const found = await this.extraordinaryRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Extraordinary budget not found');
    return found;
  }

  async update(id: number, dto: UpdateExtraordinaryDto) {
    const found = await this.findOne(id);

    if (dto.extraordinaryAmount !== undefined) {
      if (Number(dto.extraordinaryAmount) < 0) {
        throw new BadRequestException('Extraordinary amount must be >= 0');
      }
      found.extraordinaryAmount = dto.extraordinaryAmount;
    }

    if (dto.description !== undefined) found.description = dto.description;

    return this.extraordinaryRepo.save(found);
  }

  async remove(id: number) {
    const found = await this.findOne(id);
    await this.extraordinaryRepo.remove(found);
    return { deleted: true, id };
  }

  /** Asigna/actualiza el monto de UNA categoría y ajusta ambos saldos */
  async assignOne(extraId: number, dto: AssignOneDto) {
  const extra = await this.extraordinaryRepo.findOne({ where: { id: extraId } });
  if (!extra) throw new NotFoundException('Extraordinary budget not found');

  const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId }, relations: ['projection'] });
  if (!category) throw new NotFoundException('Category not found');

  const newAmount = Number(dto.assigned_amount);

  // Calcula aquí el nuevo amount de la categoría (fuera de la TX)
  const oldAssigned = await this.assignRepo.findOne({
    where: { extraordinaryBudget: { id: extraId } as any, category: { id: dto.categoryId } as any },
  });
  const oldAmount = oldAssigned ? Number(oldAssigned.assignedAmount) : 0;
  const delta = newAmount - oldAmount;
  const projectionId = category.projection.id;
  const newCategoryAmount = (Number(category.category_amount) + delta).toFixed(2);

  // 1) SOLO guarda asignación y extraordinario dentro de la TX
  await this.dataSource.transaction(async (manager) => {
    const assignRepo = manager.getRepository(AssignBudget);
    const extraRepo  = manager.getRepository(Extraordinary);

    if (delta > Number(extra.extraordinaryAmount)) {
      throw new BadRequestException(
        `Not enough funds in extraordinary. Available: ${extra.extraordinaryAmount}, needed: ${delta}`,
      );
    }

    if (oldAssigned) {
      oldAssigned.assignedAmount = newAmount.toFixed(2);
      await assignRepo.save(oldAssigned);
    } else {
      await assignRepo.save(assignRepo.create({
        assignedAmount: newAmount.toFixed(2),
        category: { id: dto.categoryId } as any,
        extraordinaryBudget: { id: extraId } as any,
      }));
    }

    // actualiza SOLO el saldo del extraordinario
    extra.extraordinaryAmount = (Number(extra.extraordinaryAmount) - delta).toFixed(2) as any;
    await extraRepo.save(extra);
  });

  // 2) FUERA de la TX: usa tu ProjectService para actualizar category + total
  await this.projectService.setCategoryAmount(projectionId, category.id, newCategoryAmount);

  return {
    message: 'Assignment updated',
    extraordinary_after: extra.extraordinaryAmount,
    category_after: newCategoryAmount,
  };
}
  /** Elimina la asignación de UNA categoría y revierte saldos */
 async unassignOne(extraId: number, categoryId: number) {
  const extra = await this.extraordinaryRepo.findOne({ where: { id: extraId } });
  if (!extra) throw new NotFoundException('Extraordinary budget not found');

  const category = await this.categoryRepo.findOne({ where: { id: categoryId }, relations: ['projection'] });
  if (!category) throw new NotFoundException('Category not found');

  const existing = await this.assignRepo.findOne({
    where: { extraordinaryBudget: { id: extraId } as any, category: { id: categoryId } as any },
  });
  if (!existing) return { deleted: false, message: 'No assignment found' };

  const assigned = Number(existing.assignedAmount);
  const projectionId = category.projection.id;
  const newCategoryAmount = (Number(category.category_amount) - assigned).toFixed(2);

  // 1) SOLO borra asignación y ajusta extraordinario dentro de la TX
  await this.dataSource.transaction(async (manager) => {
    const assignRepo = manager.getRepository(AssignBudget);
    const extraRepo  = manager.getRepository(Extraordinary);

    await assignRepo.remove(existing);

    extra.extraordinaryAmount = (Number(extra.extraordinaryAmount) + assigned).toFixed(2) as any;
    await extraRepo.save(extra);
  });

  // 2) FUERA de la TX: actualiza categoría y total con tu ProjectService
  await this.projectService.setCategoryAmount(projectionId, category.id, newCategoryAmount);

  return {
    deleted: true,
    extraordinary_after: extra.extraordinaryAmount,
    category_after: newCategoryAmount,
  };
}

}