import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Index,
  } from 'typeorm';
  
  @Entity({ name: 'extraordinary' })
  export class Extraordinary {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Index()
    @Column({ type: 'varchar', length: 120 })
    name: string;
  
    // total amount registered for this extraordinary income
    @Column('decimal', { precision: 18, scale: 2 })
    amount: string; // TypeORM returns decimal as string
  
    // amount already allocated/used
    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    used: string;
  
    // optional manual date; defaults to today if not provided
    @Column({ type: 'date', nullable: true })
    date?: string | null;
  
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
  }
  