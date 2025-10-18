// backend/src/modules/disponibilidad/disponibilidad.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { Organizacion } from '../organizacion/entities/organizacion.entity';
import { VoluntarioIndividual } from '../voluntario-individual/entities/voluntario-individual.entity';

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(Disponibilidad)
    private disponibilidadRepository: Repository<Disponibilidad>,
  ) {}

  // ✅ Método transaccional para Organización
  async createForOrganizacionInTransaction(
    createDisponibilidadDto: CreateDisponibilidadDto,
    organizacion: Organizacion,
    manager: EntityManager,
  ): Promise<Disponibilidad> {
    const disponibilidad = manager.create(Disponibilidad, {
      tipoEntidad: 'ORGANIZACION', // ✅ AGREGADO
      fechaInicio: new Date(createDisponibilidadDto.fechaInicio),
      fechaFin: new Date(createDisponibilidadDto.fechaFin),
      dias: createDisponibilidadDto.dias,
      horarios: createDisponibilidadDto.horarios,
      organizacion,
      voluntario: undefined,
    });

    return manager.save(disponibilidad);
  }

  // ✅ Método transaccional para Voluntario
  async createForVoluntarioInTransaction(
    createDisponibilidadDto: CreateDisponibilidadDto,
    voluntario: VoluntarioIndividual,
    manager: EntityManager,
  ): Promise<Disponibilidad> {
    const disponibilidad = manager.create(Disponibilidad, {
      tipoEntidad: 'VOLUNTARIO', // ✅ AGREGADO
      fechaInicio: new Date(createDisponibilidadDto.fechaInicio),
      fechaFin: new Date(createDisponibilidadDto.fechaFin),
      dias: createDisponibilidadDto.dias,
      horarios: createDisponibilidadDto.horarios,
      organizacion: undefined,
      voluntario,
    });

    return manager.save(disponibilidad);
  }

  async findAll(): Promise<Disponibilidad[]> {
    return this.disponibilidadRepository.find({
      relations: ['organizacion', 'voluntario'],
    });
  }

  async findOne(id: number): Promise<Disponibilidad> {
    const disponibilidad = await this.disponibilidadRepository.findOne({
      where: { idDisponibilidad: id },
      relations: ['organizacion', 'voluntario'],
    });

    if (!disponibilidad) {
      throw new NotFoundException(`Disponibilidad con ID ${id} no encontrada`);
    }

    return disponibilidad;
  }

  async update(
  id: number,
  updateDisponibilidadDto: UpdateDisponibilidadDto,
): Promise<Disponibilidad> {
  const disponibilidad = await this.findOne(id);
  
  // ✅ Actualizar tipoEntidad si está presente
  if (updateDisponibilidadDto.tipoEntidad) {
    disponibilidad.tipoEntidad = updateDisponibilidadDto.tipoEntidad;
  }
  
  // ✅ Actualizar fechas si están presentes
  if (updateDisponibilidadDto.fechaInicio) {
    disponibilidad.fechaInicio = new Date(updateDisponibilidadDto.fechaInicio);
  }
  if (updateDisponibilidadDto.fechaFin) {
    disponibilidad.fechaFin = new Date(updateDisponibilidadDto.fechaFin);
  }
  
  // ✅ Actualizar arrays si están presentes
  if (updateDisponibilidadDto.dias) {
    disponibilidad.dias = updateDisponibilidadDto.dias;
  }
  if (updateDisponibilidadDto.horarios) {
    disponibilidad.horarios = updateDisponibilidadDto.horarios;
  }
  
  return this.disponibilidadRepository.save(disponibilidad);
}

  async remove(id: number): Promise<void> {
    const disponibilidad = await this.findOne(id);
    await this.disponibilidadRepository.remove(disponibilidad);
  }
}