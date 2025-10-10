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

// ✅ Listado ligero para tablas - SOLO asociados con solicitud APROBADA
// ✅ Listado ligero para tablas - SOLO asociados con solicitud APROBADA
async findAll(query?: QueryAssociateDto) {
  const { estado, search, page = 1, limit = 20, sort } = query || {};

  const queryBuilder = this.associateRepository
    .createQueryBuilder('associate')
    .leftJoinAndSelect('associate.persona', 'persona')
    .leftJoinAndSelect('associate.nucleoFamiliar', 'nucleoFamiliar')
    .leftJoinAndSelect('associate.fincas', 'fincas')
    .leftJoinAndSelect('fincas.geografia', 'geografia')
    .leftJoinAndSelect('associate.solicitud', 'solicitud');

  // ✅ REGLA DE NEGOCIO: Solo mostrar asociados con solicitud APROBADA
  // Esto cumple con:
  // 1. Asociados activos (estado=true) + solicitud APROBADA ✅
  // 2. Asociados inactivos (estado=false) + solicitud APROBADA ✅
  // 3. NO mostrar asociados con solicitud PENDIENTE o RECHAZADA ❌
  queryBuilder.andWhere('solicitud.estado = :estadoSolicitud', { 
    estadoSolicitud: 'APROBADO' 
  });

  // ✅ Filtro opcional por estado del asociado (activo/inactivo)
  // Solo se aplica si se proporciona explícitamente desde el frontend
  if (estado !== undefined) {
    queryBuilder.andWhere('associate.estado = :estado', { estado });
  }

  // ✅ Búsqueda por texto (LIKE para MySQL, case-insensitive por defecto)
  if (search) {
    queryBuilder.andWhere(
      '(persona.nombre LIKE :search OR persona.apellido1 LIKE :search OR persona.apellido2 LIKE :search OR persona.cedula LIKE :search OR persona.email LIKE :search)',
      { search: `%${search}%` },
    );
  }

  // ✅ Ordenamiento
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

  // ✅ Paginación
  queryBuilder.skip((page - 1) * limit).take(limit);

  const [items, total] = await queryBuilder.getManyAndCount();

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
  async findActive() {
    return this.associateRepository.find({
      where: { estado: true },
      relations: [
        'persona',
        'nucleoFamiliar',
        'fincas',
        'fincas.geografia',
        'solicitud',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findInactive() {
    return this.associateRepository.find({
      where: { estado: false },
      relations: [
        'persona',
        'nucleoFamiliar',
        'fincas',
        'fincas.geografia',
        'solicitud',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ Detalle completo con TODO (UN SOLO QUERY)
  async findOne(id: number): Promise<Associate> {
    const associate = await this.associateRepository.findOne({
      where: { idAsociado: id },
      relations: [
        'persona',
        'nucleoFamiliar',
        'fincas',
        'fincas.geografia',
        'fincas.propietario',
        'fincas.propietario.persona',
        'fincas.hato',
        'fincas.hato.animales',
        'fincas.forrajes',
        'fincas.registrosProductivos',
        'fincas.fuentesAgua',
        'fincas.metodosRiego',
        'fincas.actividades',
        'fincas.infraestructura',
        'fincas.otrosEquipos',
        'fincas.tipoCercaLinks',
        'fincas.tipoCercaLinks.tipoCerca',
        'fincas.infraLinks',
        'fincas.infraLinks.infraestructura',
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
      .leftJoinAndSelect('fincas.propietario', 'propietario')
      .leftJoinAndSelect('propietario.persona', 'propietarioPersona')
      .leftJoinAndSelect('fincas.hato', 'hato')
      .leftJoinAndSelect('hato.animales', 'animales')
      .leftJoinAndSelect('fincas.forrajes', 'forrajes')
      .leftJoinAndSelect('fincas.fuentesAgua', 'fuentesAgua')
      .leftJoinAndSelect('fincas.metodosRiego', 'metodosRiego')
      .leftJoinAndSelect('fincas.actividades', 'actividades')
      .leftJoinAndSelect('fincas.infraestructura', 'infraestructura')
      .leftJoinAndSelect('fincas.otrosEquipos', 'otrosEquipos')
      .leftJoinAndSelect('fincas.tipoCercaLinks', 'tipoCercaLinks')
      .leftJoinAndSelect('tipoCercaLinks.tipoCerca', 'tipoCerca')
      .leftJoinAndSelect('fincas.infraLinks', 'infraLinks')
      .leftJoinAndSelect('infraLinks.infraestructura', 'infraestructuraDetalle')
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

  // ✅ NUEVO: Detalle BÁSICO (solo info de fincas sin sus relaciones completas)
async findOneBasic(id: number): Promise<Associate> {
  const associate = await this.associateRepository.findOne({
    where: { idAsociado: id },
    relations: [
      'persona',
      'nucleoFamiliar',
      'fincas',
      'fincas.geografia',
      'fincas.propietario',
      'fincas.propietario.persona',
      'fincas.registrosProductivos', // ✅ Solo esto porque es pequeño
      'solicitud',
    ],
  });

  if (!associate) {
    throw new NotFoundException(`Asociado con ID ${id} no encontrado`);
  }

  return associate;
}
  async update(id: number, updateDto: UpdateAssociateDto): Promise<Associate> {
    const associate = await this.associateRepository.findOne({
      where: { idAsociado: id },
      relations: ['persona', 'solicitud'],
    });

    if (!associate) {
      throw new NotFoundException(`Asociado con ID ${id} no encontrado`);
    }

    if (updateDto.estado !== undefined && updateDto.estado === true) {
      if (associate.solicitud?.estado !== 'APROBADO') {
        throw new BadRequestException(
          'No se puede activar un asociado cuya solicitud no está aprobada',
        );
      }
    }

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

    if (updateDto.telefono !== undefined) {
      associate.persona.telefono = updateDto.telefono;
    }
    if (updateDto.email !== undefined) {
      associate.persona.email = updateDto.email;
    }
    if (updateDto.direccion !== undefined) {
      associate.persona.direccion = updateDto.direccion;
    }

    await this.personaRepository.save(associate.persona);
    return this.associateRepository.save(associate);
  }

  async activate(id: number): Promise<Associate> {
    const associate = await this.associateRepository.findOne({
      where: { idAsociado: id },
      relations: ['persona', 'nucleoFamiliar', 'solicitud'],
    });

    if (!associate) {
      throw new NotFoundException(`Asociado con ID ${id} no encontrado`);
    }

    if (associate.solicitud?.estado !== 'APROBADO') {
      throw new BadRequestException(
        'No se puede activar un asociado cuya solicitud no está aprobada',
      );
    }

    associate.estado = true;
    return this.associateRepository.save(associate);
  }

  async deactivate(id: number): Promise<Associate> {
    const associate = await this.associateRepository.findOne({
      where: { idAsociado: id },
      relations: ['persona', 'nucleoFamiliar', 'solicitud'],
    });

    if (!associate) {
      throw new NotFoundException(`Asociado con ID ${id} no encontrado`);
    }

    associate.estado = false;
    return this.associateRepository.save(associate);
  }

  async toggleStatus(id: number): Promise<Associate> {
    const associate = await this.associateRepository.findOne({
      where: { idAsociado: id },
      relations: ['persona', 'nucleoFamiliar', 'solicitud'],
    });

    if (!associate) {
      throw new NotFoundException(`Asociado con ID ${id} no encontrado`);
    }

    if (!associate.estado && associate.solicitud?.estado !== 'APROBADO') {
      throw new BadRequestException(
        'No se puede activar un asociado cuya solicitud no está aprobada',
      );
    }

    associate.estado = !associate.estado;
    return this.associateRepository.save(associate);
  }

  async remove(id: number): Promise<void> {
    const associate = await this.associateRepository.findOne({
      where: { idAsociado: id },
      relations: ['fincas'],
    });

    if (!associate) {
      throw new NotFoundException(`Asociado con ID ${id} no encontrado`);
    }

    if (associate.estado) {
      throw new BadRequestException(
        'No se puede eliminar un asociado activo. Desactívelo primero.',
      );
    }

    if (associate.fincas && associate.fincas.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un asociado con fincas registradas',
      );
    }

    await this.associateRepository.remove(associate);
  }

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