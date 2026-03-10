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
import { AuditUserAction } from '../dto/audit-users-action.enum';

@Entity({ name: 'audit_users' })
export class AuditUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser?: User | null;

  @ManyToOne(() => User, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'target_user_id' })
  targetUser?: User | null;

  @Index()
  @Column({
    name: 'action_type',
    type: 'enum',
    enum: AuditUserAction,
  })
  actionType: AuditUserAction;

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