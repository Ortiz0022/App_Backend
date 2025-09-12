import { IncomeType } from 'src/anualBudget/incomeType/entities/income-type.entity';
import { SpendType } from 'src/anualBudget/spendType/entities/spend-type.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'departments' })
@Unique(['name']) // evita duplicados por nombre
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @OneToMany(() => IncomeType, it => it.department)
  incomeTypes: IncomeType[];

  @OneToMany(() => SpendType, st => st.department)
  spendTypes: SpendType[];
  
}
