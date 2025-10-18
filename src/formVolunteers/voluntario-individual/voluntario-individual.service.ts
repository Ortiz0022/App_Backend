import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateVoluntarioIndividualDto } from './dto/create-voluntario-individual.dto';
import { UpdateVoluntarioIndividualDto } from './dto/update-voluntario-individual.dto';
import { VoluntarioIndividual } from './entities/voluntario-individual.entity';
import { PersonaService } from '../../formAssociates/persona/persona.service';
import { QueryVoluntarioIndividualDto } from './dto/query-voluntario-individual.dto';

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

  // Listado paginado - SOLO voluntarios con solicitud APROBADA
  async findAll(query?: QueryVoluntarioIndividualDto) {
  const { isActive, search, page = 1, limit = 20, sort } = query || {};

  // ✅ SOLUCIÓN: Convertir manualmente string a boolean
  let isActiveBoolean: boolean | undefined;
  if (isActive !== undefined) {
    if (typeof isActive === 'string') {
      isActiveBoolean = isActive === 'true';
    } else {
      isActiveBoolean = isActive;
    }
  }

  const queryBuilder = this.voluntarioRepository
    .createQueryBuilder('voluntario')
    .leftJoinAndSelect('voluntario.persona', 'persona')
    .leftJoinAndSelect('voluntario.areasInteres', 'areasInteres')
    .leftJoinAndSelect('voluntario.disponibilidades', 'disponibilidades')
    .leftJoin('voluntario.solicitud', 'solicitud');

  queryBuilder.andWhere('solicitud.estado = :estadoSolicitud', {
    estadoSolicitud: 'APROBADO',
  });

  // ✅ Usar la versión convertida
  if (isActiveBoolean !== undefined) {
    queryBuilder.andWhere('voluntario.isActive = :isActive', { 
      isActive: isActiveBoolean 
    });
  }

  if (search) {
    queryBuilder.andWhere(
      '(persona.nombre LIKE :search OR persona.apellido1 LIKE :search OR persona.apellido2 LIKE :search OR persona.cedula LIKE :search OR persona.email LIKE :search)',
      { search: `%${search}%` },
    );
  }

  if (sort) {
    const [field, order] = sort.split(':');
    const orderDirection = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (field.startsWith('persona.')) {
      queryBuilder.orderBy(field, orderDirection);
    } else {
      queryBuilder.orderBy(`voluntario.${field}`, orderDirection);
    }
  } else {
    queryBuilder.orderBy('voluntario.createdAt', 'DESC');
  }

  queryBuilder.skip((page - 1) * limit).take(limit);

  const [items, total] = await queryBuilder.getManyAndCount();

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

  async findOne(id: number): Promise<VoluntarioIndividual> {
    const voluntario = await this.voluntarioRepository.findOne({
      where: { idVoluntario: id },
      relations: [
        'persona',
        'solicitud',
        'areasInteres',
        'disponibilidades',
      ],
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

    // Actualizar campos del voluntario
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

    // Validar que no se active si la solicitud no está aprobada
    if (updateVoluntarioDto.isActive !== undefined && updateVoluntarioDto.isActive === true) {
      if (voluntario.solicitud?.estado !== 'APROBADO') {
        throw new BadRequestException(
          'No se puede activar un voluntario cuya solicitud no está aprobada',
        );
      }
    }

    if (updateVoluntarioDto.isActive !== undefined) {
      voluntario.isActive = updateVoluntarioDto.isActive;
    }

    return this.voluntarioRepository.save(voluntario);
  }

  // Toggle de estado (activar/desactivar)
  async toggleStatus(id: number): Promise<VoluntarioIndividual> {
    const voluntario = await this.voluntarioRepository.findOne({
      where: { idVoluntario: id },
      relations: ['persona', 'solicitud'],
    });

    if (!voluntario) {
      throw new NotFoundException(`Voluntario con ID ${id} no encontrado`);
    }

    // Validar que no se active si la solicitud no está aprobada
    if (!voluntario.isActive && voluntario.solicitud?.estado !== 'APROBADO') {
      throw new BadRequestException(
        'No se puede activar un voluntario cuya solicitud no está aprobada',
      );
    }

    voluntario.isActive = !voluntario.isActive;
    return this.voluntarioRepository.save(voluntario);
  }

  async remove(id: number): Promise<void> {
    const voluntario = await this.findOne(id);

    // No se puede eliminar si está activo
    if (voluntario.isActive) {
      throw new BadRequestException(
        'No se puede eliminar un voluntario activo. Desactívelo primero.',
      );
    }

    // Verificar si tiene una solicitud vinculada
    if (voluntario.solicitud) {
      throw new ConflictException(
        'No se puede eliminar el voluntario porque tiene una solicitud activa',
      );
    }

    await this.voluntarioRepository.remove(voluntario);
  }

  // Estadísticas
  async getStats() {
    const total = await this.voluntarioRepository.count();
    const activos = await this.voluntarioRepository.count({
      where: { isActive: true },
    });
    const inactivos = await this.voluntarioRepository.count({
      where: { isActive: false },
    });

    return {
      total,
      activos,
      inactivos,
      porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(2) : 0,
    };
  }
}