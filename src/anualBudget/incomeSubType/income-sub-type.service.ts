import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';
import { IncomeType } from '../incomeType/entities/income-type.entity';

@Injectable()
export class IncomeSubTypeService {
  constructor(
    @InjectRepository(IncomeSubType) private repo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType) private typeRepo: Repository<IncomeType>,
  ) {}

  private async recomputeTypeTotal(typeId: number) {
    const raw = await this.repo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.amount), 0)', 'sum')
      .where('s.incomeTypeId = :typeId', { typeId })
      .getRawOne<{ sum?: string }>();

    const type = await this.typeRepo.findOne({ where: { id: typeId } });
    if (!type) return;

    type.amountIncome = raw?.sum ?? '0';
    await this.typeRepo.save(type);
  }

  async create(dto: CreateIncomeSubTypeDto) {
    const type = await this.typeRepo.findOne({ where: { id: dto.incomeTypeId } });
    if (!type) throw new NotFoundException('IncomeType not found');

    const entity = this.repo.create({
      name: dto.name,
      amount: dto.amount,
      date: dto.date ? new Date(dto.date) : new Date(),
      incomeType: type,
    });

    const saved = await this.repo.save(entity);
    await this.recomputeTypeTotal(type.id);
    return saved;
  }

  findAll(incomeTypeId?: number) {
    if (incomeTypeId) {
      return this.repo.find({
        where: { incomeType: { id: incomeTypeId } },
        relations: ['incomeType'],
        order: { date: 'DESC', id: 'DESC' },
      });
    }
    return this.repo.find({ relations: ['incomeType'], order: { date: 'DESC', id: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!row) throw new NotFoundException('IncomeSubType not found');
    return row;
  }

  async update(id: number, dto: UpdateIncomeSubTypeDto) {
    const row = await this.repo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!row) throw new NotFoundException('IncomeSubType not found');

    const oldTypeId = row.incomeType.id;

    if (dto.incomeTypeId !== undefined) {
      const newType = await this.typeRepo.findOne({ where: { id: dto.incomeTypeId } });
      if (!newType) throw new BadRequestException('IncomeType not found');
      row.incomeType = newType;
    }
    if (dto.date !== undefined) row.date = new Date(dto.date);
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.amount !== undefined) row.amount = dto.amount;

    const saved = await this.repo.save(row);

    // Recalcular el tipo viejo y el nuevo (si cambió)
    await this.recomputeTypeTotal(oldTypeId);
    await this.recomputeTypeTotal(row.incomeType.id);

    return saved;
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!row) throw new NotFoundException('IncomeSubType not found');

    const typeId = row.incomeType.id;
    await this.repo.delete(id);
    await this.recomputeTypeTotal(typeId);
  }
}
