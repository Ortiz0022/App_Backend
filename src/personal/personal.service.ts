import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalDto } from './dto/PersonalDto';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    private personalRepository: Repository<Personal>,
  ) {}

  // Obtener todo el personal
  findAllPersonal() {
    return this.personalRepository.find();
  }

  // Obtener una persona por ID
  findOnePersonal(id: number) {
    return this.personalRepository.findOneBy({ id });
  }

  // Crear una nueva persona
  async createPersonal(personalDto: PersonalDto) {
    const newPersonal = this.personalRepository.create(personalDto);
    await this.personalRepository.save(newPersonal);
    return newPersonal;
  }

  // Eliminar una persona
  deletePersonal(id: number) {
    return this.personalRepository.delete(id);
  }

  // Actualizar una persona
  updatePersonal(id: number, personalDto: PersonalDto) {
    return this.personalRepository.update(id, personalDto);
  }
}
