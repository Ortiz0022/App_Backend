import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalYear } from './entities/fiscal-year.entity';
import { CreateFiscalYearDto } from './dto/createFiscalYearDto';

@Injectable()
export class FiscalYearService {
  constructor(
    @InjectRepository(FiscalYear)
    private readonly repo: Repository<FiscalYear>,
  ) {}

  create(dto: CreateFiscalYearDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { year: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Fiscal year not found');
    return row;
  }

  async update(id: number, partial: Partial<FiscalYear>) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Fiscal year not found');

    Object.assign(row, partial);
    return this.repo.save(row);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
  const exists = await this.repo.findOne({ where: { id } });
  if (!exists) throw new NotFoundException('Fiscal year not found');

  const res = await this.repo.delete(id);
  return { deleted: !!res.affected };
}

}
