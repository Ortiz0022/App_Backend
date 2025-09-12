import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalYear } from './entities/fiscal-year.entity';
import { CreateFiscalYearDto } from './dto/createFiscalYearDto';
import { UpdateFiscalYearDto } from './dto/updateFiscalYearDto';

@Injectable()
export class FiscalYearService {
  constructor(@InjectRepository(FiscalYear) private repo: Repository<FiscalYear>) {}

  create(dto: CreateFiscalYearDto) {
    const entity = this.repo.create({ ...dto });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { year: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('FiscalYear not found');
    return row;
  }

  async update(id: number, dto: UpdateFiscalYearDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('FiscalYear not found');
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('FiscalYear not found');
    await this.repo.delete(id);
  }

  async getActiveId(): Promise<number> {
  const fy = await this.repo.findOne({ where: { is_active: true } });
  if (!fy) throw new BadRequestException('No hay año fiscal activo');
  return fy.id;
}
}
