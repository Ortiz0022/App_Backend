import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Extraordinary } from './entities/extraordinary.entity';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AllocateExtraordinaryDto } from './dto/allocateExtraordinaryDto';


function toNumber(dec: string | number | null | undefined): number {
  if (dec === null || dec === undefined) return 0;
  return typeof dec === 'number' ? dec : parseFloat(dec);
}

@Injectable()
export class ExtraordinaryService {
  constructor(
    @InjectRepository(Extraordinary)
    private readonly repo: Repository<Extraordinary>,
  ) {}

  async create(dto: CreateExtraordinaryDto): Promise<Extraordinary> {
    const e = this.repo.create({
      name: dto.name.trim(),
      amount: dto.amount.toFixed(2),
      used: '0.00',
      date: dto.date ?? new Date().toISOString().slice(0, 10),
    });
    return this.repo.save(e);
  }

  findAll(): Promise<Extraordinary[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Extraordinary> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Extraordinary not found');
    return e;
  }

  async update(id: number, dto: UpdateExtraordinaryDto): Promise<Extraordinary> {
    const e = await this.findOne(id);

    if (dto.name !== undefined) e.name = dto.name.trim();
    if (dto.amount !== undefined) e.amount = dto.amount.toFixed(2);
    if (dto !== undefined) e.date = dto.date ?? null;

    // Admin-only manual correction (optional)
    if (dto.used !== undefined) {
      const total = toNumber(e.amount);
      const newUsed = Number(dto.used.toFixed(2));
      if (newUsed > total) throw new BadRequestException('Used exceeds total amount');
      e.used = newUsed.toFixed(2);
    }

    return this.repo.save(e);
  }

  async remove(id: number): Promise<void> {
    const e = await this.findOne(id);
    await this.repo.remove(e);
  }

  /**
   * Allocate/consume part of the extraordinary balance.
   * Increments 'used' ensuring it never exceeds 'amount'.
   */
  async allocate(id: number, dto: AllocateExtraordinaryDto): Promise<Extraordinary> {
    const e = await this.findOne(id);
    const total = toNumber(e.amount);
    const used = toNumber(e.used);
    const toAllocate = Number(dto.amount.toFixed(2));

    if (toAllocate <= 0) throw new BadRequestException('Amount must be positive');
    if (used + toAllocate > total) {
      throw new BadRequestException('Allocation exceeds available balance');
    }

    e.used = (used + toAllocate).toFixed(2);
    return this.repo.save(e);
  }

  async remaining(id: number): Promise<{ id: number; remaining: number }> {
    const e = await this.findOne(id);
    const remaining = Math.max(0, toNumber(e.amount) - toNumber(e.used));
    return { id: e.id, remaining: Number(remaining.toFixed(2)) };
  }
}
