import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeType } from './entities/income-type.entity';
import { CreateIncomeTypeDto } from './dto/createIncomeTypeDto';
import { UpdateIncomeTypeDto } from './dto/updateIncomeTypeDto';
import { IncomeTypeByDepartmentService } from '../incomeTypeByDeparment/income-type-by-department.service';

@Injectable()
export class IncomeTypeService {
  constructor(
    @InjectRepository(IncomeType) private repo: Repository<IncomeType>,
    private itbdService: IncomeTypeByDepartmentService,
  ) {}

  async create(dto: CreateIncomeTypeDto) {
    if (!dto.departmentId) {
      throw new BadRequestException('departmentId is required for IncomeType');
    }

    // setear relación por id (sin query extra)
    const entity = this.repo.create({
      name: dto.name,
      department: { id: dto.departmentId } as any,
      // amountIncome queda 0 por default
    });

    const saved = await this.repo.save(entity);

    // asegurar el cache por (department, incomeType)
    await this.itbdService.upsert?.({
      departmentId: dto.departmentId,
      incomeTypeId: saved.id,
      // opcional: amountDepIncome = '0'
    }) ?? await this.itbdService.create({
      departmentId: dto.departmentId,
      incomeTypeId: saved.id,
      // amountDepIncome por defecto 0 en la entity
    });

    return saved;
  }

  findAll() {
    // útil tener el department a la mano
    return this.repo.find({
      relations: ['department'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!row) throw new NotFoundException('IncomeType not found');
    return row;
  }

  async update(id: number, dto: UpdateIncomeTypeDto) {
    const row = await this.findOne(id);

    // manejar cambio de department (si viene)
    const prevDepartmentId = row.department?.id;
    const nextDepartmentId = dto.departmentId ?? prevDepartmentId;

    // actualizar campos simples
    if (dto.name !== undefined) row.name = dto.name;

    // si cambia el departamento, reasignar la relación
    if (nextDepartmentId !== prevDepartmentId) {
      row.department = { id: nextDepartmentId } as any;
    }

    const saved = await this.repo.save(row);

    // mantener coherencia de IncomeTypeByDepartment
    if (nextDepartmentId !== prevDepartmentId) {
      // crear/asegurar el nuevo vínculo
      await this.itbdService.upsert?.({
        departmentId: nextDepartmentId!,
        incomeTypeId: saved.id,
      }) ?? await this.itbdService.create({
        departmentId: nextDepartmentId!,
        incomeTypeId: saved.id,
      });

      // eliminar el vínculo anterior si existía
      if (prevDepartmentId) {
        await this.itbdService.removeByComposite?.(prevDepartmentId, saved.id);
        // Si no tienes removeByComposite, agrega un método en el service ITBD para borrar por (departmentId, incomeTypeId)
      }
    }

    return saved;
  }

  async remove(id: number) {
    // limpiar cache (o confiar en cascada si está configurado)
    await this.itbdService.removeByIncomeType?.(id);
    await this.repo.delete(id);
  }
}
