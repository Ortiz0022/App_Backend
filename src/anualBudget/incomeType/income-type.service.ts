// src/anualBudget/incomeType/income-type.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IncomeType } from './entities/income-type.entity';
import { CreateIncomeTypeDto } from './dto/createIncomeTypeDto';
import { UpdateIncomeTypeDto } from './dto/updateIncomeTypeDto';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { Transfer } from '../transfer/entities/transfer.entity';

@Injectable()
export class IncomeTypeService {
  constructor(
    @InjectRepository(IncomeType) private readonly repo: Repository<IncomeType>,
    @InjectRepository(IncomeSubType) private readonly subRepo: Repository<IncomeSubType>,
    @InjectRepository(Income) private readonly incRepo: Repository<Income>,
  ) {}

  async create(dto: CreateIncomeTypeDto) {
    if (!dto.departmentId) throw new BadRequestException('departmentId is required');
    const entity = this.repo.create({
      name: dto.name,
      department: { id: dto.departmentId } as any,
    });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ relations: ['department'], order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['department'] });
    if (!row) throw new NotFoundException('IncomeType not found');
    return row;
  }

  async update(id: number, dto: UpdateIncomeTypeDto) {
    const row = await this.findOne(id);
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.departmentId !== undefined) row.department = { id: dto.departmentId } as any;
    return this.repo.save(row);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  /** SUM(income.amount) filtrando por subtipos del tipo */
  async recalcAmount(incomeTypeId: number) {
    const totalRaw = await this.incRepo
      .createQueryBuilder('i')
      .innerJoin('i.incomeSubType', 's')
      .where('s.incomeType = :id', { id: incomeTypeId })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.repo.update(incomeTypeId, { amountIncome: total });
    return this.findOne(incomeTypeId);
  }

  // src/anualBudget/incomeType/income-type.service.ts
    async recalcAmountWithManager(manager: EntityManager, incomeTypeId: number) {
      const incRepo = manager.getRepository(Income);
      const trRepo  = manager.getRepository(Transfer);
      const typeRepo = manager.getRepository(IncomeType);

      // 1) Total de ingresos del IncomeType
      const totalInRaw = await incRepo
        .createQueryBuilder('i')
        .innerJoin('i.incomeSubType', 's')
        .where('s.incomeType = :id', { id: incomeTypeId })
        .select('COALESCE(SUM(i.amount),0)', 'total')
        .getRawOne<{ total: string }>();

      // 2) Total de transferencias SALIENTES desde subtipos de ese IncomeType
      const totalOutRaw = await trRepo
        .createQueryBuilder('t')
        .innerJoin('t.fromIncomeSubType', 's')
        .where('s.incomeType = :id', { id: incomeTypeId })
        .select('COALESCE(SUM(t.transferAmount),0)', 'total')
        .getRawOne<{ total: string }>();

      const totalIn  = Number(totalInRaw?.total ?? 0);
      const totalOut = Number(totalOutRaw?.total ?? 0);
      const net = (totalIn - totalOut).toFixed(2);

      // 3) Guardar el NETO en amountIncome
      await typeRepo.update(incomeTypeId, { amountIncome: net });
    }

}
 