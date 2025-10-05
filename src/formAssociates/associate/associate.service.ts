import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Associate } from './entities/associate.entity';
import { UpdateAssociateDto } from './dto/update-associate.dto';
import { QueryAssociateDto } from './dto/query-associate.dto';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';

@Injectable()
export class AssociateService {
  constructor(
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) {}

  // Listar asociados con filtros
  async findAll(query?: QueryAssociateDto) {
    const { estado, search, page = 1, limit = 20, sort } = query || {};
  
    const queryBuilder = this.associateRepository
      .createQueryBuilder('associate')
      .leftJoinAndSelect('associate.persona', 'persona')
      .leftJoinAndSelect('associate.nucleoFamiliar', 'nucleoFamiliar')
      .leftJoinAndSelect('associate.fincas', 'fincas')
      .leftJoinAndSelect('fincas.geografia', 'geografia')
      .leftJoinAndSelect('fincas.propietario', 'propietario')              // ✅ Agregar
      .leftJoinAndSelect('propietario.persona', 'propietarioPersona')      // ✅ Agregar
      .leftJoinAndSelect('associate.solicitud', 'solicitud');
  
    // ✅ Filtrar SOLO por asociados activos (estado = true)
    queryBuilder.andWhere('associate.estado = :estado', { estado: true });
  
    if (search) {
      queryBuilder.andWhere(
        '(persona.nombre ILIKE :search OR persona.apellido1 ILIKE :search OR persona.apellido2 ILIKE :search OR persona.cedula ILIKE :search OR persona.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }
  
    if (sort) {
      const [field, order] = sort.split(':');
      const orderDirection = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
      if (field.startsWith('persona.')) {
        queryBuilder.orderBy(field, orderDirection);
      } else {
        queryBuilder.orderBy(`associate.${field}`, orderDirection);
      }
    } else {
      queryBuilder.orderBy('associate.createdAt', 'DESC');
    }
  
    queryBuilder.skip((page - 1) * limit).take(limit);
  
    const [items, total] = await queryBuilder.getManyAndCount();
  
    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
  // Obtener solo asociados ACTIVOS (por defecto)
  async findActive() {
    return this.associateRepository.find({
      where: { estado: true },
      relations: [
        'persona',
        'nucleoFamiliar',
        'fincas',
        'fincas.geografia',
        'fincas.propietario',              // ✅ Agregar
        'fincas.propietario.persona',      // ✅ Agregar
        'solicitud',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener solo asociados INACTIVOS
  async findInactive() {
    return this.associateRepository.find({
      where: { estado: false },
      relations: [
        'persona',
        'nucleoFamiliar',
        'fincas',
        'fincas.geografia',
        'fincas.propietario',              // ✅ Agregar
        'fincas.propietario.persona',      // ✅ Agregar
        'solicitud',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Associate> {
    const associate = await this.associateRepository.findOne({
      where: { idAsociado: id },
      relations: [
        'persona',
        'nucleoFamiliar',
        'fincas',
        'fincas.geografia',
        'fincas.propietario',              // ✅ Agregar
        'fincas.propietario.persona',      // ✅ Agregar
        'solicitud',
      ],
    });
  
    if (!associate) {
      throw new NotFoundException(`Asociado con ID ${id} no encontrado`);
    }
  
    return associate;
  }

 async findByCedula(cedula: string): Promise<Associate> {
  const associate = await this.associateRepository
    .createQueryBuilder('associate')
    .leftJoinAndSelect('associate.persona', 'persona')
    .leftJoinAndSelect('associate.nucleoFamiliar', 'nucleoFamiliar')
    .leftJoinAndSelect('associate.fincas', 'fincas')
    .leftJoinAndSelect('fincas.geografia', 'geografia')
    .leftJoinAndSelect('fincas.propietario', 'propietario')              // ✅ Agregar
    .leftJoinAndSelect('propietario.persona', 'propietarioPersona')      // ✅ Agregar
    .leftJoinAndSelect('associate.solicitud', 'solicitud')
    .where('persona.cedula = :cedula', { cedula })
    .getOne();

  if (!associate) {
    throw new NotFoundException(
      `Asociado con cédula ${cedula} no encontrado`,
    );
  }

  return associate;
}

  async update(id: number, updateDto: UpdateAssociateDto): Promise<Associate> {
    const associate = await this.findOne(id);

    // Validar si se quiere activar
    if (updateDto.estado !== undefined && updateDto.estado === true) {
      if (associate.solicitud?.estado !== 'APROBADO') {
        throw new BadRequestException(
          'No se puede activar un asociado cuya solicitud no está aprobada',
        );
      }
    }

    // Actualizar campos de Asociado
    if (updateDto.distanciaFinca !== undefined) {
      associate.distanciaFinca = updateDto.distanciaFinca;
    }
    if (updateDto.viveEnFinca !== undefined) {
      associate.viveEnFinca = updateDto.viveEnFinca;
    }
    if (updateDto.marcaGanado !== undefined) {
      associate.marcaGanado = updateDto.marcaGanado;
    }
    if (updateDto.CVO !== undefined) {
      associate.CVO = updateDto.CVO;
    }
    if (updateDto.estado !== undefined) {
      associate.estado = updateDto.estado;
    }

    // Actualizar campos de Persona
    if (updateDto.telefono !== undefined) {
      associate.persona.telefono = updateDto.telefono;
      await this.personaRepository.save(associate.persona);
    }
    if (updateDto.email !== undefined) {
      associate.persona.email = updateDto.email;
      await this.personaRepository.save(associate.persona);
    }
    if (updateDto.direccion !== undefined) {
      associate.persona.direccion = updateDto.direccion;
      await this.personaRepository.save(associate.persona);
    }

    return this.associateRepository.save(associate);
  }

  // Activar asociado manualmente
  async activate(id: number): Promise<Associate> {
    const associate = await this.findOne(id);

    if (associate.solicitud?.estado !== 'APROBADO') {
      throw new BadRequestException(
        'No se puede activar un asociado cuya solicitud no está aprobada',
      );
    }

    associate.estado = true;
    return this.associateRepository.save(associate);
  }

  // Desactivar asociado manualmente
  async deactivate(id: number): Promise<Associate> {
    const associate = await this.findOne(id);
    associate.estado = false;
    return this.associateRepository.save(associate);
  }

  // Toggle estado (activar/desactivar)
  async toggleStatus(id: number): Promise<Associate> {
    const associate = await this.findOne(id);

    // Si se quiere activar, validar solicitud aprobada
    if (!associate.estado && associate.solicitud?.estado !== 'APROBADO') {
      throw new BadRequestException(
        'No se puede activar un asociado cuya solicitud no está aprobada',
      );
    }

    associate.estado = !associate.estado;
    return this.associateRepository.save(associate);
  }

  async remove(id: number): Promise<void> {
    const associate = await this.findOne(id);

    // No permitir eliminar si está activo
    if (associate.estado) {
      throw new BadRequestException(
        'No se puede eliminar un asociado activo. Desactívelo primero.',
      );
    }

    // No permitir eliminar si tiene fincas registradas
    if (associate.fincas && associate.fincas.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un asociado con fincas registradas',
      );
    }

    await this.associateRepository.remove(associate);
  }

  // Estadísticas
  async getStats() {
    const total = await this.associateRepository.count();
    const activos = await this.associateRepository.count({
      where: { estado: true },
    });
    const inactivos = await this.associateRepository.count({
      where: { estado: false },
    });

    return {
      total,
      activos,
      inactivos,
      porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(2) : 0,
    };
  }

  async countByStatus(isActive: boolean): Promise<number> {
    return this.associateRepository.count({
      where: { estado: isActive },
    });
  }
}