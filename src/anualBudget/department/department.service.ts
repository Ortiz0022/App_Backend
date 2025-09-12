import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/createDepartmentDto';
import { UpdateDepartmentDto } from './dto/updateDepartmentDto';

@Injectable()
export class DepartmentService {
  constructor(@InjectRepository(Department) private repo: Repository<Department>) {}

  create(dto: CreateDepartmentDto) {
    const entity = this.repo.create({ name: dto.name });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Department not found');
    return row;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Department not found');

    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Department not found');
    await this.repo.delete(id);
  }
}
