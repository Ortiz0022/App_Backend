import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SpendTypeByDepartment } from './entities/spend-type-by-department.entity';
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { Department } from 'src/anualBudget/department/entities/department.entity';
import { CreateSpendTypeByDepartmentDto } from './dto/createSpendTypeByDto';

@Injectable()
export class SpendTypeByDepartmentService {
  constructor(
    @InjectRepository(SpendTypeByDepartment)
    private readonly stdRepo: Repository<SpendTypeByDepartment>,
    @InjectRepository(SpendType)
    private readonly spendTypeRepo: Repository<SpendType>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  /** Crea (si no existe) la fila TOTAL del depto y la deja calculada */
  async create(dto: CreateSpendTypeByDepartmentDto) {
    const dept = await this.deptRepo.findOne({ where: { id: dto.id_Department } });
    if (!dept) throw new NotFoundException('Department not found');

    // ¿Ya existe la fila TOTAL? (spendType = NULL)
    const row = await this.stdRepo.findOne({
      where: {
        department: { id: dto.id_Department } as any,
        spendType: IsNull(),
      } as any,
      relations: ['department', 'spendType'],
    });

    // recalcular total y guardar (firma acepta null/undefined)
    return this.recalcDepartmentTotal(dto.id_Department, row ?? null);
  }

  /** Recalcula y guarda el TOTAL del departamento (spendType = NULL) */
  async recalcDepartmentTotal(
    departmentId: number,
    existing?: SpendTypeByDepartment | null, // 👈 acepta null
  ): Promise<SpendTypeByDepartment> {
    // suma de TODOS los spendType.amountSpend del depto
    const raw = await this.spendTypeRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amountSpend), 0)', 'total')
      .where('t.id_Department = :id', { id: departmentId }) // FK en tabla SpendType
      .getRawOne<{ total: string | number }>();

    const total = Number(raw?.total ?? 0);

    let row: SpendTypeByDepartment | null =
      existing ??
      (await this.stdRepo.findOne({
        where: {
          department: { id: departmentId } as any,
          spendType: IsNull(),
        } as any,
        relations: ['department', 'spendType'],
      }));

    if (!row) {
      row = this.stdRepo.create({
        department: { id: departmentId } as any,
        spendType: null,            // fila TOTAL
        amountDepSpend: total,
      });
    } else {
      row.amountDepSpend = total;
    }

    return this.stdRepo.save(row);
  }

  /** Recalcula todos los departamentos que tengan SpendTypes */
  async recalcAll(): Promise<SpendTypeByDepartment[]> {
    const ids = await this.spendTypeRepo
      .createQueryBuilder('t')
      .select('DISTINCT t.id_Department', 'id')
      .getRawMany<{ id: number }>();

    const out: SpendTypeByDepartment[] = []; // 👈 tipar el array
    for (const r of ids) {
      out.push(await this.recalcDepartmentTotal(Number(r.id)));
    }
    return out;
  }

  /** Obtiene la fila TOTAL por departamento */
  findByDepartment(departmentId: number) {
    return this.stdRepo.findOne({
      where: {
        department: { id: departmentId } as any,
        spendType: IsNull(),
      } as any,
      relations: ['department'],
    });
  }

  /** Lista todas las filas TOTALES (de todos los departamentos) */
  findAllTotals() {
    return this.stdRepo.find({
      where: { spendType: IsNull() as any },
      relations: ['department'],
      order: { id_SpendTypeByDepartment: 'ASC' },
    });
  }
}
