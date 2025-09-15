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
    @InjectRepository(PIncome)        private readonly pIncRepo:  Repository<PIncome>,      // 👈 aquí fallaba
    @InjectRepository(Department)     private readonly deptRepo:  Repository<Department>,   // si lo usas
  ) {}

  async create(dto: CreatePIncomeTypeDto) {
    if (!dto.departmentId) throw new BadRequestException('departmentId is required');
    const entity = this.typeRepo.create({
      name: dto.name,
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
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.departmentId !== undefined) row.department = { id: dto.departmentId } as any;
    return this.typeRepo.save(row);
  }

  async remove(id: number) {
    await this.typeRepo.delete(id);
    return { deleted: true };
  }

  /** SUM(income.amount) filtrando por subtipos del tipo */
  async recalcAmount(PIncomeTypeId: number) {
    const totalRaw = await this.pIncRepo
      .createQueryBuilder('i')
      .innerJoin('i.pIncomeSubType', 's')
      .where('s.pincomeType = :id', { id: PIncomeTypeId })
      .select('COALESCE(SUM(i.amount),0)', 'total')
      .getRawOne<{ total: string }>();

    const total = Number(totalRaw?.total ?? 0).toFixed(2);
    await this.typeRepo.update(PIncomeTypeId, { amountPIncome: total });
    return this.findOne(PIncomeTypeId);
  }
}
