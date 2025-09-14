import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HomeRowDto } from './dto/home-row.dto';
import { HomeSummaryDto } from './dto/home-summary.dto';

/** Tipo interno para mapear la salida de las consultas SQL */
type AmountRow = {
  departmentId: number;
  department: string;
  amount: number | string | null;
};

@Injectable()
export class HomeService {
  constructor(private readonly ds: DataSource) {}

  /** Une "actual" y "projected" por departmentId y calcula difference */
  private merge(actual: AmountRow[], projected: AmountRow[]): HomeRowDto[] {
    const map = new Map<number, HomeRowDto>();

    for (const r of actual) {
      map.set(r.departmentId, {
        departmentId: r.departmentId,
        department: r.department,
        actual: Number(r.amount ?? 0),
        projected: 0,
        difference: 0,
      });
    }
    for (const p of projected) {
      const row =
        map.get(p.departmentId) ??
        ({
          departmentId: p.departmentId,
          department: p.department,
          actual: 0,
          projected: 0,
          difference: 0,
        } as HomeRowDto);
      row.projected = Number(p.amount ?? 0);
      map.set(p.departmentId, row);
    }
    for (const row of map.values()) {
      row.difference = Number(row.actual) - Number(row.projected);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.department.localeCompare(b.department),
    );
  }

  /** Suma tipada para totales */
  private sum(rows: HomeRowDto[]) {
    return rows.reduce(
      (acc, r) => {
        acc.actual += r.actual;
        acc.projected += r.projected;
        acc.diff += r.difference;
        return acc;
      },
      { actual: 0, projected: 0, diff: 0 },
    );
  }

  /** Endpoint principal: datos para “Inicio” */
  async summary(): Promise<HomeSummaryDto> {
    // ---------- INGRESOS ----------
    const incomesActual = (await this.ds.query(
      `
      SELECT d.id_Department AS departmentId, d.name AS department,
             SUM(ISNULL(itbd.amountDepIncome,0)) AS amount
      FROM Department d
      LEFT JOIN IncomeTypeByDepartment itbd
             ON itbd.id_Department = d.id_Department
      GROUP BY d.id_Department, d.name
    `,
    )) as AmountRow[];

    const incomesProjected = (await this.ds.query(
      `
      SELECT d.id_Department AS departmentId, d.name AS department,
             SUM(ISNULL(pibd.amount,0)) AS amount
      FROM Department d
      LEFT JOIN PIncomeByDepartment pibd
             ON pibd.id_Department = d.id_Department
      GROUP BY d.id_Department, d.name
    `,
    )) as AmountRow[];

    // ---------- EGRESOS ----------
    const spendsActual = (await this.ds.query(
      `
      SELECT d.id_Department AS departmentId, d.name AS department,
             SUM(ISNULL(stbd.amountDepSpend,0)) AS amount
      FROM Department d
      LEFT JOIN SpendTypeByDepartment stbd
             ON stbd.id_Department = d.id_Department
      GROUP BY d.id_Department, d.name
    `,
    )) as AmountRow[];

    const spendsProjected = (await this.ds.query(
      `
      SELECT d.id_Department AS departmentId, d.name AS department,
             SUM(ISNULL(psbd.amount,0)) AS amount
      FROM Department d
      LEFT JOIN PSpendByDepartment psbd
             ON psbd.id_Department = d.id_Department
      GROUP BY d.id_Department, d.name
    `,
    )) as AmountRow[];

    // Construcción de tablas
    const incomes = this.merge(incomesActual, incomesProjected);
    const spends  = this.merge(spendsActual, spendsProjected);

    // Totales por bloque
    const ti = this.sum(incomes);
    const ts = this.sum(spends);

    // Totales del header
    const header = {
      incomeActual:     ti.actual,
      incomeProjected:  ti.projected,
      spendActual:      ts.actual,
      spendProjected:   ts.projected,
      netActual:        ti.actual - ts.actual,
      netProjected:     ti.projected - ts.projected,
      netVariance:     (ti.actual - ts.actual) - (ti.projected - ts.projected),
    };

    const result: HomeSummaryDto = {
      header,
      incomes,
      spends,
      totals: {
        incomesActual: ti.actual,
        incomesProjected: ti.projected,
        incomesDiff: ti.diff,
        spendsActual: ts.actual,
        spendsProjected: ts.projected,
        spendsDiff: ts.diff,
      },
    };
    return result;
  }
}
