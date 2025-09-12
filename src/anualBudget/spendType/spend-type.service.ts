// src/spendType/spend-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SpendType } from './entities/spend-type.entity';
import { SpendSubType } from '../spendSubType/entities/spend-sub-type.entity';
import { CreateSpendTypeDto } from './dto/createSpendTypeDto';
import { UpdateSpendTypeDto } from './dto/updateSpendTypeDto';
import { Department } from '../department/entities/department.entity';

@Injectable()
export class SpendTypeService {
  constructor(
    @InjectRepository(SpendType) private readonly typeRepo: Repository<SpendType>,
    @InjectRepository(SpendSubType) private readonly subRepo: Repository<SpendSubType>,
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
  ) {}

  async create(dto: CreateSpendTypeDto) {
    const dept = await this.deptRepo.findOne({
      where: { id: dto.id_Department }, // 👈 nombre correcto
    });
    if (!dept) throw new NotFoundException('Department not found');
  
    const type = this.typeRepo.create({
      name: dto.name,
      department: dept, // asignación del department
    });
    return this.typeRepo.save(type);
  }

  findAll() {
    return this.typeRepo.find({
      relations: ['spendSubTypes', 'department'], // 👈 incluir department en las lecturas
    });
  }

  findOne(id: number) {
    return this.typeRepo.findOne({
      where: { id_SpendType: id },
      relations: ['spendSubTypes', 'department'],
    });
  }

  // Evitar que sobreescriban amountSpend por API
  async update(id: number, dto: UpdateSpendTypeDto) {
    const entity = await this.typeRepo.findOne({ where: { id_SpendType: id }, relations: ['department'] });
    if (!entity) throw new NotFoundException('SpendType not found');

    if (dto.name !== undefined) entity.name = dto.name;

    // Permitir moverlo a otro Department (opcional)
    if (dto.id_Department !== undefined && dto.id_Department !== entity.department?.id) {
      const dept = await this.deptRepo.findOne({
        where: { id: dto.id_Department },
      });
      if (!dept) throw new NotFoundException('Department not found');
      entity.department = dept;
    }

    await this.typeRepo.save(entity);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.typeRepo.delete(id);
  }

  /** Recalcula y guarda la suma de TODOS los SpendSubType de un SpendType */
  async recalcAmount(spendTypeId: number) {
    const row = await this.subRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.amount), 0)', 'total')
      .where('s.id_SpendType = :id', { id: spendTypeId })
      .getRawOne<{ total: string | number }>();

    const total = Number(row?.total ?? 0);
    await this.typeRepo.update(spendTypeId, { amountSpend: total });
    return this.findOne(spendTypeId);
  }
}
