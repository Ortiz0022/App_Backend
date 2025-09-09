// extraordinary-budget.entity.ts
import { AssignBudget } from "src/anualBudget/assing/entities/assing.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "extraordinary" })
export class Extraordinary {
  @PrimaryGeneratedColumn({ name: "id_ExtraordinaryBudget" })
  id: number;

  @Column({ name: "extraordinary_amount", type: "decimal", precision: 14, scale: 2, default: 0 })
  extraordinaryAmount: string;

  @Column({ name: "description", type: "varchar", length: 150, nullable: true })
  description?: string;

  @OneToMany(() => AssignBudget, (a) => a.extraordinaryBudget)
  assignments: AssignBudget[];
}
