import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Extraordinary } from './entities/extraordinary.entity';
import { CreateExtraordinaryDto } from './dto/createExtraordinaryDto';
import { UpdateExtraordinaryDto } from './dto/updateExtraordinaryDto';
import { AllocateExtraordinaryDto } from './dto/allocateExtraordinaryDto';
import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { IncomeSubType } from 'src/anualBudget/incomeSubType/entities/income-sub-type.entity';
import { Income } from 'src/anualBudget/income/entities/income.entity';
import { AssignExtraordinaryDto } from './dto/assignExtraordinaryDto';
import { IncomeTypeService } from '../incomeType/income-type.service';

    function toNumber(dec: string | number | null | undefined): number {
      if (dec === null || dec === undefined) return 0;
      return typeof dec === 'number' ? dec : parseFloat(dec);
    }

    @Injectable()
    export class ExtraordinaryService {
      constructor(
        @InjectRepository(Extraordinary)
        private readonly repo: Repository<Extraordinary>,
        @InjectRepository(IncomeType)
        private readonly typeRepo: Repository<IncomeType>,
        @InjectRepository(IncomeSubType)
        private readonly subRepo: Repository<IncomeSubType>,
        @InjectRepository(Income)
        private readonly incRepo: Repository<Income>,
        private readonly incomeTypeService: IncomeTypeService,
      ) {}

      findAll(): Promise<Extraordinary[]> {
        return this.repo.find({ order: { createdAt: 'DESC' } });
      }

      async findOne(id: number): Promise<Extraordinary> {
        const e = await this.repo.findOne({ where: { id } });
        if (!e) throw new NotFoundException('Extraordinary not found');
        return e;
      }

      async create(dto: CreateExtraordinaryDto): Promise<Extraordinary> {
        const amountNum = Number.parseFloat(String(dto.amount));
        if (!Number.isFinite(amountNum) || amountNum < 0) {
          throw new BadRequestException('Invalid amount');
        }
      
        const dateStr =
          dto.date && dto.date.trim() !== '' ? dto.date : new Date().toISOString().slice(0, 10);
      
        const e = this.repo.create({
          name: dto.name.trim(),
          amount: amountNum.toFixed(2), // DECIMAL como string
          used: '0.00',
          date: dateStr,
        });
        return this.repo.save(e);
      }
      
      async update(id: number, dto: UpdateExtraordinaryDto): Promise<Extraordinary> {
        const e = await this.findOne(id);
      
        if (dto.name !== undefined) e.name = dto.name.trim();
      
        if (dto.amount !== undefined) {
          const amountNum = Number.parseFloat(String(dto.amount));
          if (!Number.isFinite(amountNum) || amountNum < 0) {
            throw new BadRequestException('Invalid amount');
          }
          if (Number(e.used) > amountNum) {
            throw new BadRequestException('Used exceeds total amount');
          }
          e.amount = amountNum.toFixed(2);
        }
      
        if (dto.date !== undefined) {
          e.date = dto.date && dto.date.trim() !== '' ? dto.date : null;
        }
      
        if (dto.used !== undefined) {
          const total = Number(e.amount);
          const newUsed = Number((+dto.used).toFixed(2));
          if (!Number.isFinite(newUsed) || newUsed < 0) {
            throw new BadRequestException('Invalid used value');
          }
          if (newUsed > total) throw new BadRequestException('Used exceeds total amount');
          e.used = newUsed.toFixed(2);
        }
      
        return this.repo.save(e);
      }
      
      async assignToIncome(dto: AssignExtraordinaryDto) {
        return this.repo.manager.transaction(async (em: EntityManager) => {
          // 1. Buscar extraordinary
          const extra = await em.findOne(Extraordinary, {
            where: { id: dto.extraordinaryId },
          });
          if (!extra) throw new NotFoundException('Extraordinary not found');
    
          const saldo = Number(extra.amount) - Number(extra.used);
          if (dto.amount > saldo) {
            throw new BadRequestException('Amount exceeds extraordinary balance');
          }
    
          // 2. Buscar IncomeType "MOVIMIENTO EXTRAORDINARIO" en el depto
          let type = await em.findOne(IncomeType, {
            where: { name: 'MOVIMIENTO EXTRAORDINARIO', department: { id: dto.departmentId } },
            relations: ['department'],
          });
          if (!type) {
            // opcional: lo creamos automáticamente
            type = em.create(IncomeType, {
              name: 'MOVIMIENTO EXTRAORDINARIO',
              department: { id: dto.departmentId } as any,
            });
            await em.save(type);
          }
    
          // 3. Buscar/crear IncomeSubType dentro del type
          let subType = await em.findOne(IncomeSubType, {
            where: { name: dto.subTypeName, incomeType: { id: type.id } },
          });
          if (!subType) {
            subType = em.create(IncomeSubType, {
              name: dto.subTypeName,
              incomeType: { id: type.id } as any,
            });
            await em.save(subType);
          }
    
          // 4. Crear Income
          const inc = em.create(Income, {
            incomeSubType: { id: subType.id } as any,
            amount: dto.amount.toFixed(2),
            date: dto.date || new Date().toISOString().slice(0, 10),
          });
          await em.save(inc);
    
          // 5. Actualizar usado del extraordinary
          extra.used = (Number(extra.used) + dto.amount).toFixed(2);
          await em.save(extra);
    
          await this.incomeTypeService.recalcAmountWithManager(em, type.id);
          
          return { extraordinary: extra, income: inc, subType };
        });
      }

      async allocate(id: number, dto: AllocateExtraordinaryDto): Promise<Extraordinary> {
        const e = await this.findOne(id);
        const total = Number(e.amount);
        const used = Number(e.used);
        const toAllocate = Math.round(Number(dto.amount) * 100) / 100;
      
        if (!Number.isFinite(toAllocate) || toAllocate <= 0) {
          throw new BadRequestException('Amount must be positive');
        }
        if (used + toAllocate > total) {
          throw new BadRequestException('Allocation exceeds available balance');
        }
      
        e.used = (used + toAllocate).toFixed(2);
        return this.repo.save(e);
      }      

      async remove(id: number): Promise<void> {
        const e = await this.findOne(id);
        await this.repo.remove(e);
      }

      async remaining(id: number): Promise<{ id: number; remaining: number }> {
        const e = await this.findOne(id);
        const remaining = Math.max(0, toNumber(e.amount) - toNumber(e.used));
        return { id: e.id, remaining: Number(remaining.toFixed(2)) };
      }
}
