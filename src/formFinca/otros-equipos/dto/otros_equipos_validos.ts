export const OTROS_EQUIPOS_VALIDOS = [
    'Vehículo de carga',
    'Camión',
    'Tractor',
    'Tráiler',
    'Bomba de espalda',
    'Motobomba',
    'Desramadora',
    'Chuzo eléctrico',
    'Equipo aplicación intravenosa',
    'Equipo de marcaje',
    'Pistola dosificadora',
    'Botiquín',
  ] as const;
  
  export type OtroEquipoValido = typeof OTROS_EQUIPOS_VALIDOS[number];