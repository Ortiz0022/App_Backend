// src/anualBudget/fiscalYear/fiscal-year.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
    return this.repo.findOne({
      where: { start_date: Between('0000-01-01', date), end_date: Between(date, '9999-12-31') } as any,
    });
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

  async getActiveOrCurrent(): Promise<FiscalYear | null> {
    // 1) Activo
    const active = await this.repo.findOne({ where: { is_active: true } });
    if (active) return active;

    // 2) Abierto más reciente
    const open = await this.repo.findOne({ where: { state: FiscalState.OPEN }, order: { year: 'DESC' } });
    if (open) return open;

    // 3) El más reciente
    const last = await this.repo.findOne({ order: { year: 'DESC' } });
    return last ?? null;
  }

  /**
   * Devuelve el FY para la fecha; si no hay, retorna el activo/actual.
   * Útil para "reales" (Income/Spend) y fallback para proyecciones.
   */
  async resolveByDateOrActive(date?: string): Promise<FiscalYear | null> {
    if (date) {
      const byDate = await this.findByDate(date);
      if (byDate) return byDate;
    }
    return this.getActiveOrCurrent();
  }

}
