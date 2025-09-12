import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeType } from './entities/income-type.entity';
import { CreateIncomeTypeDto } from './dto/createIncomeTypeDto';
import { UpdateIncomeTypeDto } from './dto/updateIncomeTypeDto';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { IncomeTypeByDepartmentService } from '../incomeTypeByDeparment/income-type-by-department.service';

@Injectable()
export class IncomeTypeService {
  constructor(
    @InjectRepository(IncomeType) private readonly repo: Repository<IncomeType>,
    @InjectRepository(IncomeSubType) private readonly subRepo: Repository<IncomeSubType>,
    private readonly itbdService: IncomeTypeByDepartmentService, // debe exponer recalcDepartmentTotal
  ) {}

  async create(dto: CreateIncomeTypeDto) {
    if (!dto.departmentId) {
      throw new BadRequestException('departmentId is required for IncomeType');
    }

    // setear relación por id (sin leer Department)
    const entity = this.repo.create({
      name: dto.name,
      department: { id: dto.departmentId } as any,
    });

    const saved = await this.repo.save(entity);

    // recalcular el total del departamento (ingresos)
    await this.itbdService.recalcDepartmentTotal(dto.departmentId);

    return saved;
  }

  findAll() {
    return this.repo.find({
      relations: ['department'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['department'] });
    if (!row) throw new NotFoundException('IncomeType not found');
    return row;
  }

  async update(id: number, dto: UpdateIncomeTypeDto) {
    const row = await this.findOne(id);
    const prevDeptId = row.department?.id;

    if (dto.name !== undefined) row.name = dto.name;
    if (dto.departmentId !== undefined && dto.departmentId !== prevDeptId) {
      row.department = { id: dto.departmentId } as any;
    }

    const saved = await this.repo.save(row);

    // Recalcular totales por departamento si cambió
    if (dto.departmentId !== undefined && dto.departmentId !== prevDeptId) {
      await this.itbdService.recalcDepartmentTotal(dto.departmentId);
      if (prevDeptId) await this.itbdService.recalcDepartmentTotal(prevDeptId);
    }

    return saved;
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    const deptId = row.department?.id;
    await this.repo.delete(id);
    if (deptId) await this.itbdService.recalcDepartmentTotal(deptId);
  }

  /** Recalcula y persiste SUM(IncomeSubType.amount) -> IncomeType.amountIncome
   *  y luego actualiza el total del departamento correspondiente. */
  async recalcAmount(incomeTypeId: number) {
    const raw = await this.subRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.amount), 0)', 'total')
      .where('s.id_IncomeType = :id', { id: incomeTypeId }) // usa el nombre real de tu FK
      .getRawOne<{ total: string | number }>();

    const total = Number(raw?.total ?? 0).toFixed(2);
    await this.repo.update(incomeTypeId, { amountIncome: total });

    const type = await this.repo.findOne({ where: { id: incomeTypeId }, relations: ['department'] });
    if (type?.department?.id) {
      await this.itbdService.recalcDepartmentTotal(type.department.id);
    }

    return this.findOne(incomeTypeId);
  }
}
