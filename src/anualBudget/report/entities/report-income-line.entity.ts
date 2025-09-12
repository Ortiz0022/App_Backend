import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ReportIncomeLine' })
export class ReportIncomeLine {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  report_income_line_id: string;

  @Column()
  report_id: number;

  @Column()
  income_type_by_department_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'date', nullable: true })
  line_date?: string;

  @Column({ length: 200, nullable: true })
  note?: string;
}
