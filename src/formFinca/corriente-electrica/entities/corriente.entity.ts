// import { Finca } from 'src/formFinca/finca/entities/finca.entity';
// import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


// // ENUM definido aquí, sin archivo extra
// export enum CorrienteNombre {
//   PUBLICA = 'Publica',
//   PRIVADA = 'Privada',
// }

// @Entity('corrienteelectrica')
// export class CorrienteElectrica {
//   @PrimaryGeneratedColumn({ name: 'idCorrienteElectrica', type: 'int' })
//   idCorrienteElectrica: number;

//   @Column({
//     type: 'enum',
//     enum: CorrienteNombre,
//   })
//   nombre: CorrienteNombre;

//   // Opcional: navegación inversa (las fincas que usan este suministro)
//   @OneToMany(() => Finca, (f) => f.corriente)
//   fincas: Finca[];
// }
