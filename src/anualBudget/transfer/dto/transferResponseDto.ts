// src/transfer/dto/transfer-response.dto.ts
import { Transfer } from '../entities/transfer.entity';
import { Spend } from 'src/anualBudget/spend/entities/spend.entity';

export class TransferResponseDto {
  transfer: Transfer;
  spend: Spend;
  // saldo restante del subtipo de ingreso después de esta operación
  remainingFromIncomeSubType: number;
}
