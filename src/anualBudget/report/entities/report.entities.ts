import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export type ReportType = 'income'|'spend'|'proj_income'|'proj_spend'|'transfer'|'summary';

@Entity({ name: 'Reports' })
export class Report {
  @PrimaryGeneratedColumn()
  report_id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 30 })
  report_type: ReportType;

  @CreateDateColumn({ type: 'datetime2' })
  generated_at: Date;

  @Column({ length: 120 })
  generated_by: string;

  @Column({ length: 500, nullable: true })
  parameters?: string; // JSON con filtros

  @Column({ length: 300, nullable: true })
  file_path?: string;

  // anclajes opcionales para filtrar el historial:
  @Column({ type: 'int', nullable: true })
  department_id?: number;

  @Column({ type: 'int', nullable: true })
  fiscal_year_id?: number;
}
