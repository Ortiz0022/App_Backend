// src/anualBudget/incomeType/income-type.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PIncomeType } from './entities/pincome-type.entity';
import { PIncomeSubType } from '../pIncomeSubType/entities/pincome-sub-type.entity';
import { PIncome } from '../pIncome/entities/pIncome.entity';
import { CreatePIncomeTypeDto } from './dto/createPIncomeTypeDto';
import { UpdatePIncomeTypeDto } from './dto/updatePIncomeTypeDto';
import { Department } from '../department/entities/department.entity';

@Injectable()
export class PIncomeTypeService {
  constructor(
    @InjectRepository(PIncomeType)    private readonly typeRepo: Repository<PIncomeType>,
    @InjectRepository(PIncomeSubType) private readonly subRepo:  Repository<PIncomeSubType>,
    @InjectRepository(PIncome)        private readonly pIncRepo:  Repository<PIncome>,
    @InjectRepository(Department)     private readonly deptRepo:  Repository<Department>,
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

    const rows = await this.typeRepo.find({
      where: { department: { id: departmentId } } as any,
      select: { id: true, name: true } as any,
    });

    const dup = rows.find((r) => (ignoreId ? r.id !== ignoreId : true) && this.normalizeKey(r.name) === key);
    if (dup) throw new BadRequestException('Ya existe un tipo con ese nombre.');
  }

  async create(dto: CreatePIncomeTypeDto) {
    if (!dto.departmentId) throw new BadRequestException('departmentId is required');

    const cleanName = this.normalizeName(dto.name);
    await this.assertNoDuplicateName(cleanName, dto.departmentId);

    const entity = this.typeRepo.create({
      name: cleanName,
      department: { id: dto.departmentId } as any,
    });
    return this.typeRepo.save(entity);
  }

  findAll() {
    return this.typeRepo.find({ relations: ['department'], order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.typeRepo.findOne({ where: { id }, relations: ['department'] });
    if (!row) throw new NotFoundException('PIncomeType not found');
    return row;
  }

  async update(id: number, dto: UpdatePIncomeTypeDto) {
    const row = await this.findOne(id);

    const nextDeptId = dto.departmentId !== undefined ? dto.departmentId : row.department?.id;

    if (dto.name !== undefined) {
      const cleanName = this.normalizeName(dto.name);
      if (nextDeptId) await this.assertNoDuplicateName(cleanName, nextDeptId, id);
      row.name = cleanName;
    }

    if (dto.departmentId !== undefined) row.department = { id: dto.departmentId } as any;
    return this.typeRepo.save(row);
  }

  async remove(id: number) {
    await this.typeRepo.delete(id);
    return { deleted: true };
  }

  async recalcAmount(PIncomeTypeId: number) {
    const totalRaw = await this.pIncRepo
      .createQueryBuilder('i')
      .innerJoin('i.pIncomeSubType', 's')
      .where('s.pIncomeType = :id', { id: PIncomeTypeId })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.typeRepo.update(PIncomeTypeId, { amountPIncome: total });
    return this.findOne(PIncomeTypeId);
  }
}