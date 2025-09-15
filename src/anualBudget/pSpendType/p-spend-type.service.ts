// src/anualBudget/pSpendType/p-spend-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpendType } from './entities/p-spend-type.entity';
import { Department } from '../department/entities/department.entity';
import { CreatePSpendTypeDto } from './dto/create.dto';
import { UpdatePSpendTypeDto } from './dto/update.dto';

@Injectable()
export class PSpendTypeService {
  constructor(
    @InjectRepository(PSpendType) private repo: Repository<PSpendType>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
  ) {}

  async create(dto: CreatePSpendTypeDto) {
    const department = await this.deptRepo.findOneBy({ id: dto.departmentId });
    if (!department) throw new NotFoundException('Department no existe');
    const row = this.repo.create({ name: dto.name, department });
    return this.repo.save(row);
  }

  // GET /p-spend-type?departmentId=2
  findAll(departmentId?: number) {
    if (departmentId) return this.repo.find({ where: { department: { id: departmentId } } });
    return this.repo.find();
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async update(id: number, dto: UpdatePSpendTypeDto) {
    const item = await this.findOne(id);
    if (dto.departmentId) {
      const department = await this.deptRepo.findOneBy({ id: dto.departmentId });
      if (!department) throw new NotFoundException('Department no existe');
      item.department = department;
    }
    if (dto.name !== undefined) item.name = dto.name;
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { ok: true };
  }
}
