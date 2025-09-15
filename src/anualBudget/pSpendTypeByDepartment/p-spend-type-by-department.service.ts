import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpendTypeByDepartment } from './entities/p-spend-type-by-department.entity';
import { Department } from '../department/entities/department.entity';
import { CreatePSpendTypeByDepartmentDto } from './dto/create.dto';
import { UpdatePSpendTypeByDepartmentDto } from './dto/update.dto';

@Injectable()
export class PSpendTypeByDepartmentService {
  constructor(
    @InjectRepository(PSpendTypeByDepartment) private repo: Repository<PSpendTypeByDepartment>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
  ) {}

  async create(dto: CreatePSpendTypeByDepartmentDto) {
    const department = await this.deptRepo.findOneBy({ id: dto.departmentId });
    if (!department) throw new NotFoundException('Department no existe');
    const row = this.repo.create({ amountDepPSpend: dto.amountDepPSpend, department });
    return this.repo.save(row);
  }

  // GET /p-spend-type-by-department?departmentId=1
  findAll(departmentId?: number) {
    if (departmentId) {
      return this.repo.find({ where: { department: { id: departmentId } } });
    }
    return this.repo.find();
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
