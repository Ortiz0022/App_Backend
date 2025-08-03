import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Associate } from './entities/associates.entity';
import { AssociateDto } from './dto/AssociatesDto';


@Injectable()
export class AssociateService {
  constructor(
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
  ) {}

  // Obtener todos los registros
  findAllAssociates() {
    return this.associateRepository.find();
  }

  // Obtener un registro por ID
  findOneAssociate(id: number) {
    return this.associateRepository.findOneBy({ id });
  }

  // Crear un nuevo registro
  async createAssociate(associateDto: AssociateDto) {
    const newAssociate = this.associateRepository.create(associateDto);
    await this.associateRepository.save(newAssociate);
    return newAssociate;
  }

  // Eliminar un registro
  deleteAssociate(id: number) {
    return this.associateRepository.delete(id);
  }

  // Actualizar un registro
  updateAssociate(id: number, associateDto: AssociateDto) {
    return this.associateRepository.update(id, associateDto);
  }
}
