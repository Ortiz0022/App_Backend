import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Volunteers } from './entities/volunteers.entity';
import { VolunteerDto } from './dto/VolunteersDto';


@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(Volunteers)
    private volunteersRepository: Repository<Volunteers>,
  ) {}

  // Obtener todos los voluntarios
  findAllVolunteers() {
    return this.volunteersRepository.find();
  }

  // Obtener un voluntario por ID
  findOneVolunteer(id: number) {
    return this.volunteersRepository.findOneBy({ id });
  }

  // Crear un nuevo voluntario
  async createVolunteer(volunteerDto: VolunteerDto) {
    const newVolunteer = this.volunteersRepository.create(volunteerDto);
    await this.volunteersRepository.save(newVolunteer);
    return newVolunteer;
  }

  // Eliminar un voluntario por ID
  deleteVolunteer(id: number) {
    return this.volunteersRepository.delete(id);
  }

  // Actualizar un voluntario
  updateVolunteer(id: number, volunteerDto: VolunteerDto) {
    return this.volunteersRepository.update(id, volunteerDto);
  }
}
