import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpendType } from './entities/spend-type.entity';
import { CreateSpendTypeDto } from './dto/createSpendTypeDto';
import { UpdateSpendTypeDto } from './dto/updateSpendTypeDto';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Spend } from '../spend/entities/spend.entity';


@Injectable()
export class SpendTypeService {
  constructor(
    @InjectRepository(SpendType)    private readonly repo: Repository<SpendType>,
    @InjectRepository(SpendSubType) private readonly subRepo: Repository<SpendSubType>,
    @InjectRepository(Spend)        private readonly spendRepo: Repository<Spend>,
  ) {}

  async create(dto: CreateSpendTypeDto) {
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
    if (!row) throw new NotFoundException('SpendType not found');
    return row;
  }

  async update(id: number, dto: UpdateSpendTypeDto) {
    const row = await this.findOne(id);
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.departmentId !== undefined) row.department = { id: dto.departmentId } as any;
    return this.repo.save(row);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  /** SUM(spend.amount) filtrando por subtipos del tipo */
  async recalcAmount(spendTypeId: number) {
    const totalRaw = await this.spendRepo
      .createQueryBuilder('sp')
      .innerJoin('sp.spendSubType', 's')
      .where('s.spendType = :id', { id: spendTypeId })
      .select('COALESCE(SUM(sp.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.repo.update(spendTypeId, { amountSpend: total });
    return this.findOne(spendTypeId);
  }
}
