import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateVoluntarioIndividualDto } from './dto/create-voluntario-individual.dto';
import { UpdateVoluntarioIndividualDto } from './dto/update-voluntario-individual.dto';
import { VoluntarioIndividual } from './entities/voluntario-individual.entity';
import { PersonaService } from '../../formAssociates/persona/persona.service';

@Injectable()
export class VoluntarioIndividualService {
  constructor(
    @InjectRepository(VoluntarioIndividual)
    private voluntarioRepository: Repository<VoluntarioIndividual>,
    private personaService: PersonaService,
  ) {}

  // Método transaccional (sin validaciones, usa EntityManager externo)
  async createInTransaction(
    createVoluntarioDto: CreateVoluntarioIndividualDto,
    manager: EntityManager,
  ): Promise<VoluntarioIndividual> {
    // Crear persona dentro de la transacción
    const persona = await this.personaService.createInTransaction(
      createVoluntarioDto.persona,
      manager,
    );

    // Crear voluntario
    const voluntario = manager.create(VoluntarioIndividual, {
      persona,
      motivacion: createVoluntarioDto.motivacion,
      habilidades: createVoluntarioDto.habilidades,
      experiencia: createVoluntarioDto.experiencia,
      nacionalidad: createVoluntarioDto.nacionalidad,
    });

    return manager.save(voluntario);
  }

  async findAll(): Promise<VoluntarioIndividual[]> {
    return this.voluntarioRepository.find({
      relations: ['persona', 'solicitud'],
    });
  }

  async findOne(id: number): Promise<VoluntarioIndividual> {
    const voluntario = await this.voluntarioRepository.findOne({
      where: { idVoluntario: id },
      relations: ['persona', 'solicitud'],
    });

    if (!voluntario) {
      throw new NotFoundException(`Voluntario con ID ${id} no encontrado`);
    }

    return voluntario;
  }

 async update(
  id: number,
  updateVoluntarioDto: UpdateVoluntarioIndividualDto,
): Promise<VoluntarioIndividual> {
  const voluntario = await this.findOne(id);

  // Actualizar solo los campos del voluntario (no persona)
  if (updateVoluntarioDto.motivacion !== undefined) {
    voluntario.motivacion = updateVoluntarioDto.motivacion;
  }
  
  if (updateVoluntarioDto.habilidades !== undefined) {
    voluntario.habilidades = updateVoluntarioDto.habilidades;
  }
  
  if (updateVoluntarioDto.experiencia !== undefined) {
    voluntario.experiencia = updateVoluntarioDto.experiencia;
  }
  
  if (updateVoluntarioDto.nacionalidad !== undefined) {
    voluntario.nacionalidad = updateVoluntarioDto.nacionalidad;
  }

  return this.voluntarioRepository.save(voluntario);
}
  async remove(id: number): Promise<void> {
    const voluntario = await this.findOne(id);

    // Verificar si tiene una solicitud vinculada
    if (voluntario.solicitud) {
      throw new ConflictException(
        `No se puede eliminar el voluntario porque tiene una solicitud activa`,
      );
    }

    await this.voluntarioRepository.remove(voluntario);
  }
}