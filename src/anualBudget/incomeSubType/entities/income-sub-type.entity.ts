import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IncomeType } from '../../incomeType/entities/income-type.entity';

@Entity({ name: 'income_sub_types' })
export class IncomeSubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @Column({ type: 'datetime' })
  date: Date;

  @ManyToOne(() => IncomeType, (t) => t.subTypes, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'id_IncomeType' }) // <-- así el query usa s.id_IncomeType
incomeType: IncomeType;

}
