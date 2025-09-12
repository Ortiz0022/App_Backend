export class HomeRowDto {
    /** ID del departamento */
    departmentId: number;
  
    /** Nombre del departamento */
    department: string;
  
    /** Monto real (actual) acumulado por departamento */
    actual: number;
  
    /** Monto proyectado (presupuesto) por departamento */
    projected: number;
  
    /** Diferencia = actual - projected */
    difference: number;
  }
  