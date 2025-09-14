import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpendSubType } from './entities/spend-sub-type.entity';
import { CreateSpendSubTypeDto } from './dto/createSpendSubTypeDto';
import { UpdateSpendSubTypeDto } from './dto/updateSpendSubTypeDto';
import { SpendType } from '../spendType/entities/spend-type.entity';
import { SpendTypeService } from '../spendType/spend-type.service';

@Injectable()
export class SpendSubTypeService {
  constructor(
    @InjectRepository(SpendSubType) private readonly repo: Repository<SpendSubType>,
    @InjectRepository(SpendType)    private readonly typeRepo: Repository<SpendType>,
    private readonly typeService: SpendTypeService,
  ) {}

  private async getType(id: number) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BadRequestException('SpendType not found');
    return t;
  }

  async create(dto: CreateSpendSubTypeDto) {
    await this.getType(dto.spendTypeId);
    const entity = this.repo.create({
      name: dto.name,
      spendType: { id: dto.spendTypeId } as any,
    });
    return this.repo.save(entity);
  }

  findAll(spendTypeId?: number) {
    const where = spendTypeId ? { spendType: { id: spendTypeId } } : {};
    return this.repo.find({ where: where as any, relations: ['spendType'], order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['spendType'] });
    if (!row) throw new NotFoundException('SpendSubType not found');
    return row;
  }

  async update(id: number, dto: UpdateSpendSubTypeDto) {
    const row = await this.findOne(id);
    const oldTypeId = row.spendType.id;

    if (dto.name !== undefined) row.name = dto.name;
    if (dto.spendTypeId !== undefined) {
      await this.getType(dto.spendTypeId);
      row.spendType = { id: dto.spendTypeId } as any;
    }

    const saved = await this.repo.save(row);

    // Si cambió de tipo, recalcular totales del tipo viejo y el nuevo (las sumas salen de Spend)
    if (dto.spendTypeId !== undefined && dto.spendTypeId !== oldTypeId) {
      await this.typeService.recalcAmount(oldTypeId);
      await this.typeService.recalcAmount(dto.spendTypeId);
    }
    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.delete(id);
    // La suma por tipo no cambia hasta que se creen/borren Spends asociados
    return { deleted: true };
  }
}
