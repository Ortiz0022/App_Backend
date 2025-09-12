// src/transfer/transfer.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { CreateTransferDto } from './dto/createTransferDto';
import { UpdateTransferDto } from './dto/updateTransferDto';
import { FilterTransferDto } from './dto/filterTransferDto';
import { EntityManager } from 'typeorm';
import { SpendType } from '../spendType/entities/spend-type.entity';
// import { IncomeType } from '../incomeType/entities/income-type.entity';
// import { SpendType } from '../spendType/entities/spend-type.entity';

@Injectable()
export class TransferService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Transfer) private readonly repo: Repository<Transfer>,
    //@InjectRepository(IncomeType) private readonly incomeRepo: Repository<IncomeType>,
    @InjectRepository(SpendType) private readonly spendRepo: Repository<SpendType>,
  ) {}

  // async create(dto: CreateTransferDto): Promise<Transfer> {
  // const { id_FromIncomeType, id_ToSpendType, transferAmount } = dto;

  // return this.dataSource.transaction<Transfer>(async (manager: EntityManager) => {
  //  // const incomeRepo   = manager.getRepository(IncomeType);
  //  // const spendRepo    = manager.getRepository(SpendType);
  //   const transferRepo = manager.getRepository(Transfer);

  //   const income = await this.incomeRepo.findOne({ where: { id: id_FromIncomeType } });
  //   if (!income) throw new NotFoundException('IncomeType no existe');
  //   if (!income.isExtra) throw new BadRequestException('El IncomeType no es de movimiento extraordinario');

  //   const amount    = Number(transferAmount);
  //   const available = Number(income.extraBalance ?? 0);

  //   if (!(amount > 0)) throw new BadRequestException('transferAmount debe ser mayor que 0');
  //   if (amount > available) throw new BadRequestException(`Saldo insuficiente (disponible ${available})`);

  //   const spend = await spendRepo.findOne({ where: { id: id_ToSpendType } });
  //   if (!spend) throw new NotFoundException('SpendType no existe');

  //   // Actualizar saldos (ajusta nombres reales de tus campos)
  //   income.extraBalance = String(available - amount);
  //   spend.extraAssigned = String(Number(spend.extraAssigned ?? 0) + amount);

  //   await incomeRepo.save(income);   // guarda OBJETO, no array
  //   await spendRepo.save(spend);

  //   // Crear y guardar la transferencia (devuelve 1 objeto)
  //   const transfer = transferRepo.create({
  //     name: dto.name,
  //     date: dto.date ? new Date(dto.date) : null,
  //     detail: dto.detail ?? null,
  //     transferAmount: String(amount),    // column decimal -> string en TypeORM
  //     fromIncomeType: income,
  //     toSpendType: spend,
  //   });

  //   return transferRepo.save(transfer);  // <- Promise<Transfer>, NO array
  // });
  // }

  async findAll(filter: FilterTransferDto): Promise<Transfer[]> {
    const where: any = {};
    if (filter.id_FromIncomeType) where.fromIncomeType = { id: filter.id_FromIncomeType };
    if (filter.id_ToSpendType) where.toSpendType = { id: filter.id_ToSpendType };
    if (filter.fromDate || filter.toDate) {
      const from = filter.fromDate ? new Date(filter.fromDate) : new Date('2020-01-01');
      const to = filter.toDate ? new Date(filter.toDate) : new Date('2025-12-31');
      where.createdAt = Between(from, to);
    }
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Transfer> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Transfer no existe');
    return t;
  }

  // Nota: por regla contable normalmente NO se permite editar/borrrar una transferencia
  // publicada; si lo vas a permitir, deberías revertir saldos con otra transacción.
  async remove(id: number): Promise<void> {
    const t = await this.findOne(id);
    await this.repo.remove(t);
  }

  async update(id: number, _dto: UpdateTransferDto): Promise<Transfer> {
    // Por simplicidad, solo permite editar metadatos (name, detail, date). No tocar saldos.
    const t = await this.findOne(id);
    const { name, detail, date} = _dto;
    if (name !== undefined) t.name = name;
    if (detail !== undefined) t.detail = detail;
    if (date !== undefined) t.date = date ? new Date(date) : null;
    return this.repo.save(t);
  }
}
