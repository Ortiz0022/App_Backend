import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';
import { Extraordinary } from 'src/anualBudget/extraordinary/entities/extraordinary.entity';
import { AuditBudgetEntity } from '../dto/audit-budget-entity.enum';
import { AuditBudgetAction } from '../dto/audit-budget-action.enum';
import { AuditBudgetScope } from '../dto/audit-budget-scope.enum';


@Entity({ name: 'audit_budget' })
export class AuditBudget {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser?: User | null;

  @Index()
  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: AuditBudgetEntity,
  })
  entityType: AuditBudgetEntity;

  @Index()
  @Column({
    name: 'entity_id',
    type: 'int',
  })
  entityId: number;

  @Index()
  @Column({
    name: 'action_type',
    type: 'enum',
    enum: AuditBudgetAction,
  })
  actionType: AuditBudgetAction;

  @Index()
  @Column({
    name: 'budget_scope',
    type: 'enum',
    enum: AuditBudgetScope,
  })
  budgetScope: AuditBudgetScope;

  @Column('decimal', {
    name: 'old_amount',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  oldAmount?: string | null;

  @Column('decimal', {
    name: 'new_amount',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  newAmount?: string | null;

  @Column('decimal', {
    name: 'old_used',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  oldUsed?: string | null;

  @Column('decimal', {
    name: 'new_used',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  newUsed?: string | null;

  @Column({
    name: 'old_date',
    type: 'date',
    nullable: true,
  })
  oldDate?: string | null;

  @Column({
    name: 'new_date',
    type: 'date',
    nullable: true,
  })
  newDate?: string | null;

  @Column({
    name: 'old_name',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  oldName?: string | null;

  @Column({
    name: 'new_name',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  newName?: string | null;

  @ManyToOne(() => FiscalYear, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fiscal_year_id' })
  fiscalYear?: FiscalYear | null;

  @Column({
    name: 'sub_type_table',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  subTypeTable?: string | null;

  @Column({
    name: 'sub_type_id',
    type: 'int',
    nullable: true,
  })
  subTypeId?: number | null;

  @ManyToOne(() => Extraordinary, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'related_extraordinary_id' })
  relatedExtraordinary?: Extraordinary | null;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'snapshot_before',
    type: 'json',
    nullable: true,
  })
  snapshotBefore?: Record<string, any> | null;

  @Column({
    name: 'snapshot_after',
    type: 'json',
    nullable: true,
  })
  snapshotAfter?: Record<string, any> | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;
}