import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeSubType } from './entities/income-sub-type.entity';
import { CreateIncomeSubTypeDto } from './dto/createIncomeSubTypeDto';
import { UpdateIncomeSubTypeDto } from './dto/updateIncomeSubTypeDto';
import { IncomeType } from '../incomeType/entities/income-type.entity';
import { IncomeTypeByDepartmentService } from '../incomeTypeByDeparment/income-type-by-department.service';

@Injectable()
export class IncomeSubTypeService {
  constructor(
    @InjectRepository(IncomeSubType) private readonly repo: Repository<IncomeSubType>,
    @InjectRepository(IncomeType)    private readonly typeRepo: Repository<IncomeType>,
    private readonly itbdService: IncomeTypeByDepartmentService, // 👈 para total de depto
  ) {}

  /** Suma los subtypes y guarda amountIncome en IncomeType; luego recalcula total del depto. */
  private async recomputeTypeAndDepartment(typeId: number) {
    // ⚠️ Usa el nombre real de tu FK en la tabla de subtypes:
    // si en tu entity tienes @JoinColumn({name: 'id_IncomeType'}) usa 's.id_IncomeType'
    const raw = await this.repo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.amount), 0)', 'sum')
      .where('s.id_IncomeType = :id', { id: typeId }) // <-- cambia a 'incomeTypeId' si así se llama tu FK
      .getRawOne<{ sum?: string }>();

    const type = await this.typeRepo.findOne({
      where: { id: typeId },
      relations: ['department'],
    });
    if (!type) return;

    type.amountIncome = raw?.sum ?? '0';
    await this.typeRepo.save(type);

    // actualizar total del departamento en ingresos
    const deptId = (type.department as any)?.id;
    if (deptId) await this.itbdService.recalcDepartmentTotal(deptId);
  }

  async create(dto: CreateIncomeSubTypeDto) {
    const type = await this.typeRepo.findOne({
      where: { id: Number(dto.incomeTypeId) },
      relations: ['department'],
    });
    if (!type) throw new NotFoundException('IncomeType not found');

    const entity = this.repo.create({
      name: dto.name,
      amount: dto.amount,
      date: dto.date ? new Date(dto.date) : new Date(),
      incomeType: { id: type.id } as any,
    });

    const saved = await this.repo.save(entity);
    await this.recomputeTypeAndDepartment(type.id);
    return saved;
  }

  findAll(incomeTypeId?: number) {
    const where = incomeTypeId ? { incomeType: { id: incomeTypeId } } : {};
    return this.repo.find({
      where: where as any,
      relations: ['incomeType'],
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!row) throw new NotFoundException('IncomeSubType not found');
    return row;
  }

  async update(id: number, dto: UpdateIncomeSubTypeDto) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['incomeType', 'incomeType.department'],
    });
    if (!row) throw new NotFoundException('IncomeSubType not found');

    const oldTypeId = row.incomeType.id;

    // reasignar de tipo si viene
    if (dto.incomeTypeId !== undefined) {
      const newType = await this.typeRepo.findOne({ where: { id: Number(dto.incomeTypeId) } });
      if (!newType) throw new BadRequestException('IncomeType not found');
      row.incomeType = newType;
    }

    if (dto.name   !== undefined) row.name   = dto.name;
    if (dto.amount !== undefined) row.amount = dto.amount;
    if (dto.date   !== undefined) row.date   = new Date(dto.date);

    const saved = await this.repo.save(row);

    // Recalcular el tipo viejo y el nuevo (si cambió)
    await this.recomputeTypeAndDepartment(oldTypeId);
    if (row.incomeType.id !== oldTypeId) {
      await this.recomputeTypeAndDepartment(row.incomeType.id);
    }

    return saved;
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['incomeType'] });
    if (!row) throw new NotFoundException('IncomeSubType not found');

    const typeId = row.incomeType.id;
    await this.repo.delete(id);
    await this.recomputeTypeAndDepartment(typeId);
  }
}
