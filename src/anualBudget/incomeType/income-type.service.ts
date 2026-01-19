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

  /**
   * Recalcula y persiste amountIncome del IncomeType
   * = SUM(IncomeSubType.amountSubIncome) de todos sus subtypes
   */
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

   private normalizeName(name: string) {
    return name.trim().replace(/\s+/g, ' ');
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

    // Buscar si ya existe en real
    const existing = await this.repo
      .createQueryBuilder('t')
      .innerJoin('t.department', 'd')
      .where('d.id = :deptId', { deptId })
      .andWhere('LOWER(t.name) = LOWER(:name)', { name })
      .getOne();

    if (existing) return existing;

    // Crear si no existe
    const created = this.repo.create({
      name,
      department: { id: deptId } as any,
    });

    return this.repo.save(created);
  }
}
