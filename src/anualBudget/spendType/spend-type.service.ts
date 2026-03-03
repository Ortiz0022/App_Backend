import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SpendType } from './entities/spend-type.entity';
import { CreateSpendTypeDto } from './dto/createSpendTypeDto';
import { UpdateSpendTypeDto } from './dto/updateSpendTypeDto';
import { SpendSubType } from 'src/anualBudget/spendSubType/entities/spend-sub-type.entity';
import { Spend } from '../spend/entities/spend.entity';
import { PSpendType } from 'src/anualBudget/pSpendType/entities/p-spend-type.entity';

@Injectable()
export class SpendTypeService {
  constructor(
    @InjectRepository(SpendType)    private readonly repo: Repository<SpendType>,
    @InjectRepository(SpendSubType) private readonly subRepo: Repository<SpendSubType>,
    @InjectRepository(Spend)        private readonly _spendRepo: Repository<Spend>,
    @InjectRepository(PSpendType)   private readonly pTypeRepo: Repository<PSpendType>,
  ) {}

  private normalizeKey(input: string) {
    return (input ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private normalizeName(name: string) {
    return (name ?? '').trim().replace(/\s+/g, ' ');
  }

  private async assertNoDuplicateName(name: string, departmentId: number, ignoreId?: number) {
    const key = this.normalizeKey(name);

    const rows = await this.repo.find({
      where: { department: { id: departmentId } } as any,
      select: { id: true, name: true } as any,
    });

    const dup = rows.find((r) => (ignoreId ? r.id !== ignoreId : true) && this.normalizeKey(r.name) === key);
    if (dup) throw new BadRequestException('Ya existe un tipo con ese nombre.');
  }

  async create(dto: CreateSpendTypeDto) {
    if (!dto.departmentId) throw new BadRequestException('departmentId is required');

    const name = this.normalizeName(dto.name);
    await this.assertNoDuplicateName(name, dto.departmentId);

    const entity = this.repo.create({
      name,
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

    const nextDeptId = dto.departmentId !== undefined ? dto.departmentId : row.department?.id;

    if (dto.name !== undefined) {
      const name = this.normalizeName(dto.name);
      if (nextDeptId) await this.assertNoDuplicateName(name, nextDeptId, id);
      row.name = name;
    }

    if (dto.departmentId !== undefined) row.department = { id: dto.departmentId } as any;
    return this.repo.save(row);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  async recalcAmount(spendTypeId: number) {
    const totalRaw = await this.subRepo
      .createQueryBuilder('s')
      .where('s.spendTypeId = :id', { id: spendTypeId })
      .select('COALESCE(SUM(s.amountSubSpend), 0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.repo.update(spendTypeId, { amountSpend: total });
    return this.findOne(spendTypeId);
  }

  async recalcAmountWithManager(em: EntityManager, spendTypeId: number) {
    const totalRaw = await em
      .createQueryBuilder(SpendSubType, 's')
      .where('s.spendType = :id', { id: spendTypeId })
      .select('COALESCE(SUM(s.amountSubSpend), 0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await em.update(SpendType, spendTypeId, { amountSpend: total });
    return total;
  }

  async ensureFromProjection(pSpendTypeId: number) {
    const pType = await this.pTypeRepo.findOne({
      where: { id: pSpendTypeId },
      relations: ['department'],
    });

    if (!pType) throw new NotFoundException('PSpendType not found');

    const name = this.normalizeName(pType.name);
    const deptId = pType.department?.id;

    if (!name) throw new BadRequestException('Projection type name is empty');
    if (!deptId) throw new BadRequestException('PSpendType has no department');

    const key = this.normalizeKey(name);

    const rows = await this.repo.find({
      where: { department: { id: deptId } } as any,
      select: { id: true, name: true } as any,
    });

    const dup = rows.find((r) => this.normalizeKey(r.name) === key);
    if (dup) return this.findOne(dup.id);

    const created = this.repo.create({
      name,
      department: { id: deptId } as any,
    });

    const saved = await this.repo.save(created);
    return this.findOne(saved.id);
  }
}