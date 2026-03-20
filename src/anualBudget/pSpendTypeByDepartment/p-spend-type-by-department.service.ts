import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpendTypeByDepartment } from './entities/p-spend-type-by-department.entity';
import { Department } from '../department/entities/department.entity';
import { FiscalYear } from '../fiscalYear/entities/fiscal-year.entity';
import { PSpend } from '../pSpend/entities/p-spend.entity';
import { CreatePSpendTypeByDepartmentDto } from './dto/create.dto';
import { UpdatePSpendTypeByDepartmentDto } from './dto/update.dto';

@Injectable()
export class PSpendTypeByDepartmentService {
  constructor(
    @InjectRepository(PSpendTypeByDepartment) private repo: Repository<PSpendTypeByDepartment>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(FiscalYear) private fyRepo: Repository<FiscalYear>,
    @InjectRepository(PSpend) private pSpendRepo: Repository<PSpend>,
  ) {}

    async create(dto: CreatePSpendTypeByDepartmentDto) {
    const department = await this.deptRepo.findOneBy({ id: dto.departmentId });
    if (!department) throw new NotFoundException('Department no existe');
    const row = this.repo.create({ amountDepPSpend: dto.amountDepPSpend, department });
    return this.repo.save(row);
  }

  async recalcAllForFiscalYear(fiscalYearId: number): Promise<PSpendTypeByDepartment[]> {
    const fy = await this.fyRepo.findOne({ where: { id: fiscalYearId } });
    if (!fy) throw new NotFoundException('FiscalYear no existe');

    const rows = await this.pSpendRepo
      .createQueryBuilder('ps')
      .innerJoin('ps.fiscalYear', 'fy')
      .innerJoin('ps.subType', 'st')
      .innerJoin('st.type', 't')
      .innerJoin('t.department', 'd')
      .where('fy.id = :fiscalYearId', { fiscalYearId })
      .select('d.id', 'departmentId')
      .addSelect('COALESCE(SUM(ps.amount), 0)', 'total')
      .groupBy('d.id')
      .getRawMany<{ departmentId: number; total: string }>();

    for (const r of rows) {
      const deptId = Number(r.departmentId);

      let snap = await this.repo.findOne({
        where: {
          department: { id: deptId } as any,
          fiscalYear: { id: fiscalYearId } as any,
        } as any,
      });

      if (!snap) {
        snap = this.repo.create({
          department: { id: deptId } as any,
          fiscalYear: { id: fiscalYearId } as any,
          amountDepPSpend: 0,
        });
      }

      snap.amountDepPSpend = Number(r.total ?? 0);
      await this.repo.save(snap);
    }

    const allDepts = await this.deptRepo.find();
    for (const d of allDepts) {
      const exist = await this.repo.findOne({
        where: {
          department: { id: d.id } as any,
          fiscalYear: { id: fiscalYearId } as any,
        } as any,
      });

      if (!exist) {
        await this.repo.save(
          this.repo.create({
            department: { id: d.id } as any,
            fiscalYear: { id: fiscalYearId } as any,
            amountDepPSpend: 0,
          }),
        );
      }
    }

    return this.findAll(undefined, fiscalYearId);
  }

  findAll(departmentId?: number, fiscalYearId?: number) {
    const where: any = {};
    if (departmentId) where.department = { id: departmentId };
    if (fiscalYearId) where.fiscalYear = { id: fiscalYearId };

    return this.repo.find({ where });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

   async update(id: number, dto: UpdatePSpendTypeByDepartmentDto) {
    const item = await this.findOne(id);
    if (dto.departmentId) {
      const department = await this.deptRepo.findOneBy({ id: dto.departmentId });
      if (!department) throw new NotFoundException('Department no existe');
      item.department = department;
    }
    if (dto.amountDepPSpend !== undefined) item.amountDepPSpend = dto.amountDepPSpend;
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}