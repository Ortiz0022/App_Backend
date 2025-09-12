import { HomeRowDto } from "./home-row.dto";

export class HeaderTotalsDto {
  incomeActual: number;      // ∑ ingresos reales (todos los deptos)
  incomeProjected: number;   // ∑ ingresos proyectados
  spendActual: number;       // ∑ egresos reales
  spendProjected: number;    // ∑ egresos proyectados
  netActual: number;         // incomeActual - spendActual
  netProjected: number;      // incomeProjected - spendProjected
  netVariance: number;       // netActual - netProjected
}

export class HomeTotalsDto {
  incomesActual: number; incomesProjected: number; incomesDiff: number;
  spendsActual: number;  spendsProjected: number;  spendsDiff: number;
}

export class HomeSummaryDto {
  header: HeaderTotalsDto;   // 👈 totales globales para la parte superior
  incomes: HomeRowDto[];
  spends: HomeRowDto[];
  totals: HomeTotalsDto;     // totales por bloque (ingresos / egresos)
}
