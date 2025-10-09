export const INFRAESTRUCTURAS_VALIDAS = [
    'Corral',
    'Picadora',
    'Comederos',
    'Abrevadero',
    'Cargadero',
    'Bodega',
    'Tacho',
    'Piso',
    'Otros',
  ] as const;
  
  export type InfraestructuraValida = typeof INFRAESTRUCTURAS_VALIDAS[number];