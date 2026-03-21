import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalYear, FiscalState } from './entities/fiscal-year.entity';
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

  async findByDate(date: string): Promise<FiscalYear | null> {
  return this.repo
    .createQueryBuilder('fy')
    .where(':date BETWEEN fy.start_date AND fy.end_date', { date })
    .getOne();
}

  async assertOpenByDate(date: string) {
    const fy = await this.findByDate(date);
    if (!fy) throw new BadRequestException('No hay año fiscal para la fecha');
    if (fy.state === FiscalState.CLOSED) {
      throw new BadRequestException('Año fiscal CERRADO: no se permiten cambios');
    }
    return fy;
  }





    // --- NUEVOS HELPERS --- //
  async findByIdSafe(id: number | string) {
    if (!id && id !== 0) return null;
    const n = Number(id);
    const row = await this.repo.findOne({ where: { id: Number.isFinite(n) ? n : (id as any) } as any });
    return row ?? null;
  }

  async findByCodeSafe(code: string) {
    const y = Number(code);
    if (!Number.isFinite(y)) return null;
    const row = await this.repo.findOne({ where: { year: y } });
    return row ?? null;
  }

  async getActiveOrCurrent(): Promise<FiscalYear> {
      const fy = await this.repo.findOne({ where: { is_active: true } });

  if (!fy) {
    throw new BadRequestException('No hay año fiscal activo');
  }

  return fy;
  }

   async assertSelectedOpenActiveFiscalYearByDate(
    fiscalYearId: number,
    date: string,
  ): Promise<FiscalYear> {
    const fy = await this.findOne(fiscalYearId);

    if (!fy.is_active) {
      throw new BadRequestException('El año fiscal seleccionado no está activo');
    }

    if (fy.state === FiscalState.CLOSED) {
      throw new BadRequestException('El año fiscal seleccionado está cerrado');
    }

    const input = String(date).slice(0, 10);
    const start = String(fy.start_date).slice(0, 10);
    const end = String(fy.end_date).slice(0, 10);

    if (input < start || input > end) {
      throw new BadRequestException('La fecha no pertenece al año fiscal seleccionado');
    }

    return fy;
  }
  
  async assertSelectedOpenActiveFiscalYear(fiscalYearId: number) {
  const fy = await this.findOne(fiscalYearId);

  if (!fy.is_active) {
    throw new BadRequestException('El año fiscal seleccionado no está activo');
  }

  if (fy.state === FiscalState.CLOSED) {
    throw new BadRequestException('El año fiscal seleccionado está cerrado');
  }

  return fy;
}
}
