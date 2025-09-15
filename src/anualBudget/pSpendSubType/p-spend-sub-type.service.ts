import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PSpendSubType } from './entities/p-spend-sub-type.entity';
import { PSpendType } from '../pSpendType/entities/p-spend-type.entity';
import { CreatePSpendSubTypeDto } from './dto/create.dto';
import { UpdatePSpendSubTypeDto } from './dto/update.dto';

@Injectable()
export class PSpendSubTypeService {
  constructor(
    @InjectRepository(PSpendSubType) private repo: Repository<PSpendSubType>,
    @InjectRepository(PSpendType) private typeRepo: Repository<PSpendType>,
  ) {}

  async create(dto: CreatePSpendSubTypeDto) {
    const type = await this.typeRepo.findOneBy({ id: dto.typeId });
    if (!type) throw new NotFoundException('Type no existe');
    const row = this.repo.create({ name: dto.name, type });
    return this.repo.save(row);
  }

  // GET /p-spend-sub-type?typeId=1
  findAll(typeId?: number) {
    if (typeId) return this.repo.find({ where: { type: { id: typeId } } });
    return this.repo.find();
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async update(id: number, dto: UpdatePSpendSubTypeDto) {
    const item = await this.findOne(id);
    if (dto.typeId) {
      const type = await this.typeRepo.findOneBy({ id: dto.typeId });
      if (!type) throw new NotFoundException('Type no existe');
      item.type = type;
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
