// src/anualBudget/incomeTypeByDeparment/income-type-by-department.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeTypeByDepartment } from './entities/income-type-by-department.entity';
import { CreateIncomeTypeByDepartmentDto } from './dto/createIncomeTypeByDepartmentDto';
import { UpdateIncomeTypeByDepartmentDto } from './dto/updateIncomeTypeByDepartmentDto';

@Injectable()
export class IncomeTypeByDepartmentService {
  constructor(
    @InjectRepository(IncomeTypeByDepartment)
    private readonly repo: Repository<IncomeTypeByDepartment>,
  ) {}

  async create(dto: CreateIncomeTypeByDepartmentDto) {
    const entity = this.repo.create({
      department: { id: dto.departmentId } as any,
      incomeType: { id: dto.incomeTypeId } as any,
      amountDepIncome: dto.amountDepIncome ?? '0',
    });
    return this.repo.save(entity);
  }

  // ✅ requerido por tu controller
  findAll(p0: number | undefined) {
    return this.repo.find({
      relations: ['department', 'incomeType'],
      order: { id: 'ASC' },
    });
  }

  // ✅ requerido por tu controller
  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['department', 'incomeType'],
    });
    if (!row) throw new NotFoundException('IncomeTypeByDepartment not found');
    return row;
  }

  // ✅ requerido por tu controller
  async update(id: number, dto: UpdateIncomeTypeByDepartmentDto) {
    const row = await this.findOne(id);

    if (dto.amountDepIncome !== undefined) {
      row.amountDepIncome = dto.amountDepIncome;
    }
    if (dto.departmentId) {
      row.department = { id: dto.departmentId } as any;
    }
    if (dto.incomeTypeId) {
      row.incomeType = { id: dto.incomeTypeId } as any;
    }

    return this.repo.save(row);
  }

  // ✅ requerido por tu controller
 async getTotal(departmentId: number) {
  const row = await this.repo
    .createQueryBuilder('itbd')
    .select('COALESCE(SUM(itbd.amountDepIncome), 0)', 'total')
    .where('itbd.departmentId = :departmentId', { departmentId })
    .getRawOne<{ total: string }>(); // <- puede ser undefined

  const total = row?.total ?? '0';   // <- fallback seguro
  return { departmentId, total };    // total queda string (DECIMAL)
}


  // Helpers opcionales (por si los usas en otros servicios)
  async findByComposite(departmentId: number, incomeTypeId: number) {
    return this.repo.findOne({
      where: {
        department: { id: departmentId },
        incomeType: { id: incomeTypeId },
      },
    });
  }

  async upsert(dto: CreateIncomeTypeByDepartmentDto) {
    const found = await this.findByComposite(dto.departmentId, dto.incomeTypeId);
    if (!found) return this.create(dto);
    if (dto.amountDepIncome !== undefined) {
      found.amountDepIncome = dto.amountDepIncome;
      return this.repo.save(found);
    }
    return found;
  }

  async removeByComposite(departmentId: number, incomeTypeId: number) {
    const row = await this.findByComposite(departmentId, incomeTypeId);
    if (row) await this.repo.remove(row);
  }

  async removeByIncomeType(incomeTypeId: number) {
    const rows = await this.repo.find({ where: { incomeType: { id: incomeTypeId } } });
    if (rows.length) await this.repo.remove(rows);
  }
}
