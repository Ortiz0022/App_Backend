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
import { IncomeSubTypeService } from 'src/anualBudget/incomeSubType/income-sub-type.service';

    function toNumber(dec: string | number | null | undefined): number {
      if (dec === null || dec === undefined) return 0;
      return typeof dec === 'number' ? dec : parseFloat(dec);
    }

    @Injectable()
    export class ExtraordinaryService {
      constructor(
        @InjectRepository(Extraordinary) private readonly repo: Repository<Extraordinary>,
        @InjectRepository(IncomeType) private readonly typeRepo: Repository<IncomeType>,
        @InjectRepository(IncomeSubType) private readonly subRepo: Repository<IncomeSubType>,
        @InjectRepository(Income) private readonly incRepo: Repository<Income>,
        private readonly incomeTypeService: IncomeTypeService,
        private readonly incomeSubTypeService: IncomeSubTypeService, // ⬅️ nuevo
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
          // 1) Extraordinary
          const extra = await em.findOne(Extraordinary, { where: { id: dto.extraordinaryId } });
          if (!extra) throw new NotFoundException('Extraordinary not found');
      
          const assignAmt = Number(dto.amount);
          if (!Number.isFinite(assignAmt) || assignAmt <= 0) {
            throw new BadRequestException('Amount must be positive');
          }
      
          const saldo = Number(extra.amount) - Number(extra.used);
          if (assignAmt > saldo) {
            throw new BadRequestException('Amount exceeds extraordinary balance');
          }
      
          // 2) IncomeType fijo "MOVIMIENTO EXTRAORDINARIO" por departamento
          let type = await em.findOne(IncomeType, {
            where: { name: 'MOVIMIENTO EXTRAORDINARIO', department: { id: dto.departmentId } },
            relations: ['department'],
          });
          if (!type) {
            type = em.create(IncomeType, {
              name: 'MOVIMIENTO EXTRAORDINARIO',
              department: { id: dto.departmentId } as any,
              amountIncome: '0.00',
            });
            await em.save(type);
          }
      
          // 3) IncomeSubType (razón). Si no existe bajo ese type, créalo.
          const subName = dto.subTypeName.trim();
          if (!subName) throw new BadRequestException('subTypeName is required');
      
          let subType = await em.findOne(IncomeSubType, {
            where: { name: subName, incomeType: { id: type.id } },
            relations: ['incomeType'],
          });
          if (!subType) {
            subType = em.create(IncomeSubType, {
              name: subName,
              incomeType: { id: type.id } as any,
              amountSubIncome: '0.00',
            });
            await em.save(subType);
          }
      
          // 4) Crear Income bajo ese SubType
          const dateStr = dto.date && dto.date.trim() !== '' ? dto.date : new Date().toISOString().slice(0, 10);
          const inc = em.create(Income, {
            incomeSubType: { id: subType.id } as any,
            amount: assignAmt.toFixed(2),
            date: dateStr,
          });
          await em.save(inc);
      
          // 5) Restar del extraordinario
          extra.used = (Number(extra.used) + assignAmt).toFixed(2);
          await em.save(extra);
      
          // 6) Recalcular acumulados (en cadena)
          //    - recalc del SubType suma todos sus incomes → actualiza amountSubIncome
          //    - ese método al final llama recalc del Type → actualiza amountIncome
          await this.incomeSubTypeService.recalcAmount(subType.id);
      
          return { extraordinary: extra, income: inc, subType, incomeType: type };
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
