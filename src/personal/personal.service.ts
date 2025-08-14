import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalDto } from './dto/PersonalDto';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
  ) {}

  // Obtener todo el personal
  findAllPersonal() {
    return this.personalRepository.find();
  }

  // Obtener una persona por ID
  findOnePersonal(id: number) {
    return this.personalRepository.findOne({ where: { id } });
  }

  // Crear una nueva persona
  async createPersonal(dto: PersonalDto) {
    // Si el DTO aún tuviera UserId, lo ignoramos
    const { UserId, ...data } = dto as any;
    const personal = this.personalRepository.create(data);
    return this.personalRepository.save(personal);
  }

  // Eliminar una persona
  deletePersonal(id: number) {
    return this.personalRepository.delete(id);
  }

  // Actualizar una persona
  async updatePersonal(id: number, dto: PersonalDto) {
    const personal = await this.personalRepository.findOne({ where: { id } });
    if (!personal) throw new NotFoundException('Personal not found');

    const { UserId, ...data } = dto as any; // ignoramos UserId si viniera
    Object.assign(personal, data);
    return this.personalRepository.save(personal);
  }
}
