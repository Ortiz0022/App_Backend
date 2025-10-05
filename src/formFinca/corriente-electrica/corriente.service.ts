// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { CorrienteElectrica } from './entities/corriente.entity';
// import { CreateCorrienteDto } from './dto/create-corriente.dto';
// import { UpdateCorrienteDto } from './dto/update-corriente.dto';

// @Injectable()
// export class CorrienteElectricaService {
//   constructor(
//     @InjectRepository(CorrienteElectrica)
//     private readonly repo: Repository<CorrienteElectrica>,
//   ) {}

//   create(dto: CreateCorrienteDto) {
//     const entity = this.repo.create(dto);
//     return this.repo.save(entity);
//   }

//   findAll() {
//     return this.repo.find({ order: { idCorrienteElectrica: 'ASC' } });
//   }

//   async findOne(id: number) {
//     const item = await this.repo.findOne({ where: { idCorrienteElectrica: id } });
//     if (!item) throw new NotFoundException('Corriente eléctrica no encontrada');
//     return item;
//   }

//   async update(id: number, dto: UpdateCorrienteDto) {
//     const entity = await this.findOne(id);
//     Object.assign(entity, dto);
//     return this.repo.save(entity);
//   }

//   async remove(id: number) {
//     const res = await this.repo.delete(id);
//     if (!res.affected) throw new NotFoundException('Corriente eléctrica no encontrada');
//   }
// }
