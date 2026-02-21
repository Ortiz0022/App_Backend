import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/createDepartmentDto';
import { UpdateDepartmentDto } from './dto/updateDepartmentDto';
import { normalizeName } from '../shared/normalizedName';


function sanitizeLabel(input: string) {
  return input.trim().replace(/\s+/g, ' ');
}

@Injectable()
export class DepartmentService {
  constructor(@InjectRepository(Department) private repo: Repository<Department>) {}

  private async assertNoDuplicateName(name: string, ignoreId?: number) {
    const key = normalizeName(name);

    // Traemos solo lo necesario
    const all = await this.repo.find({ select: { id: true, name: true } as any });

    const duplicated = all.find((d) => {
      if (ignoreId && d.id === ignoreId) return false;
      return normalizeName(d.name) === key;
    });

    if (duplicated) {
      throw new BadRequestException('Ya existe un departamento con ese nombre.');
    }
  }

  async create(dto: CreateDepartmentDto) {
    const cleanName = sanitizeLabel(dto.name);

    await this.assertNoDuplicateName(cleanName);

    const entity = this.repo.create({ name: cleanName });
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

    if (dto.name !== undefined) {
      const cleanName = sanitizeLabel(dto.name);
      await this.assertNoDuplicateName(cleanName, id);
      row.name = cleanName;
    }

    return this.repo.save(row);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Department not found');
    await this.repo.delete(id);
  }
}