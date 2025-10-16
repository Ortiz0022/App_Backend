import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacion.dto';
import { Organizacion } from './entities/organizacion.entity';

@Injectable()
export class OrganizacionService {
  constructor(
    @InjectRepository(Organizacion)
    private organizacionRepository: Repository<Organizacion>,
  ) {}

  // Método transaccional (sin validaciones, usa EntityManager externo)
  async createInTransaction(
    createOrganizacionDto: CreateOrganizacionDto,
    manager: EntityManager,
  ): Promise<Organizacion> {
    const organizacion = manager.create(Organizacion, createOrganizacionDto);
    return manager.save(organizacion);
  }

  async findAll(): Promise<Organizacion[]> {
    return this.organizacionRepository.find({
      relations: ['solicitud'],
    });
  }

  async findOne(id: number): Promise<Organizacion> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { idOrganizacion: id },
      relations: ['solicitud'],
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    return organizacion;
  }

  async findByEmail(email: string): Promise<Organizacion> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { email },
      relations: ['solicitud'],
    });

    if (!organizacion) {
      throw new NotFoundException(
        `Organización con email ${email} no encontrada`,
      );
    }

    return organizacion;
  }

  async update(
    id: number,
    updateOrganizacionDto: UpdateOrganizacionDto,
  ): Promise<Organizacion> {
    const organizacion = await this.findOne(id);

    // Si se está actualizando el email, verificar que no exista
    if (
      updateOrganizacionDto.email &&
      updateOrganizacionDto.email !== organizacion.email
    ) {
      const existingByEmail = await this.organizacionRepository.findOne({
        where: { email: updateOrganizacionDto.email },
      });

      if (existingByEmail) {
        throw new ConflictException(
          `Ya existe una organización con el email ${updateOrganizacionDto.email}`,
        );
      }
    }

    Object.assign(organizacion, updateOrganizacionDto);
    return this.organizacionRepository.save(organizacion);
  }

  async remove(id: number): Promise<void> {
    const organizacion = await this.findOne(id);

    // Verificar si tiene una solicitud vinculada
    if (organizacion.solicitud) {
      throw new ConflictException(
        `No se puede eliminar la organización porque tiene una solicitud activa`,
      );
    }

    await this.organizacionRepository.remove(organizacion);
  }
}