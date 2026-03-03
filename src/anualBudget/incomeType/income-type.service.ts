import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeType } from './entities/income-type.entity';
import { CreateIncomeTypeDto } from './dto/createIncomeTypeDto';
import { UpdateIncomeTypeDto } from './dto/updateIncomeTypeDto';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { PIncomeType } from 'src/anualBudget/pIncomeType/entities/pincome-type.entity';

@Injectable()
export class IncomeTypeService {
  constructor(
    @InjectRepository(IncomeType) private readonly repo: Repository<IncomeType>,
    @InjectRepository(IncomeSubType) private readonly subRepo: Repository<IncomeSubType>,
    @InjectRepository(PIncomeType) private readonly pTypeRepo: Repository<PIncomeType>,
  ) {}

  private normalizeKey(input: string) {
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private normalizeName(name: string) {
    return name.trim().replace(/\s+/g, ' ');
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

  async create(dto: CreateIncomeTypeDto) {
    if (!dto.departmentId) throw new BadRequestException('departmentId is required');

    const cleanName = this.normalizeName(dto.name);
    await this.assertNoDuplicateName(cleanName, dto.departmentId);

    const entity = this.repo.create({
      name: cleanName,
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

    const nextDeptId = dto.departmentId !== undefined ? dto.departmentId : row.department?.id;

    if (dto.name !== undefined) {
      const cleanName = this.normalizeName(dto.name);
      if (nextDeptId) await this.assertNoDuplicateName(cleanName, nextDeptId, id);
      row.name = cleanName;
    }

    if (dto.departmentId !== undefined) row.department = { id: dto.departmentId } as any;
    return this.repo.save(row);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  async recalcAmount(incomeTypeId: number) {
    const totalRaw = await this.subRepo
      .createQueryBuilder('s')
      .where('s.incomeType = :id', { id: incomeTypeId })
      .select('COALESCE(SUM(s.amountSubIncome),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.repo.update(incomeTypeId, { amountIncome: total });

    return this.findOne(incomeTypeId);
  }

  async fromProjectionType(pIncomeTypeId: number) {
    const pType = await this.pTypeRepo.findOne({
      where: { id: pIncomeTypeId },
      relations: ['department'],
    });

    if (!pType) throw new BadRequestException('PIncomeType not found');

    const name = this.normalizeName(pType.name);
    const deptId = pType.department?.id;

    if (!deptId) throw new BadRequestException('PIncomeType has no department');

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

    return this.repo.save(created);
  }
}