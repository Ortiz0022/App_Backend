import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository} from 'typeorm';
  import { Associate } from './entities/associate.entity';
  import { CreateAssociateDto } from './dto/create-associate.dto';
  import { UpdateAssociateDto } from './dto/update-associate.dto';
  import { ChangeStatusDto } from './dto/change-status.dto';
  import { QueryAssociateDto } from './dto/query-associate.dto';
  import { AssociateStatus } from './dto/associate-status.enum';
import { Persona } from '../persona/entities/persona.entity';
  
  @Injectable()
  export class AssociateService {
    constructor(
      @InjectRepository(Associate)
      private associateRepository: Repository<Associate>,
      @InjectRepository(Persona)
      private personaRepository: Repository<Persona>,
    ) {}
  
    async create(createDto: CreateAssociateDto): Promise<Associate> {
      // Verificar si ya existe una persona con esa cédula
      const existingByCedula = await this.personaRepository.findOne({
        where: { cedula: createDto.persona.cedula },
      });
  
      if (existingByCedula) {
        throw new ConflictException(
          `Ya existe una persona con la cédula ${createDto.persona.cedula}`,
        );
      }
  
      // Verificar si ya existe una persona con ese email
      const existingByEmail = await this.personaRepository.findOne({
        where: { email: createDto.persona.email },
      });
  
      if (existingByEmail) {
        throw new ConflictException(
          `Ya existe una persona con el email ${createDto.persona.email}`,
        );
      }
  
      // Crear la persona
      const persona = this.personaRepository.create(createDto.persona);
  
      // Crear el asociado con la persona
      const associate = this.associateRepository.create({
        persona,
        distanciaFinca: createDto.distanciaFinca,
        viveEnFinca: createDto.viveEnFinca,
        marcaGanado: createDto.marcaGanado,
        CVO: createDto.CVO,
        estado: createDto.estado || AssociateStatus.PENDIENTE,
      });
  
      return this.associateRepository.save(associate);
    }
  
    async findAll(query?: QueryAssociateDto) {
      const { status, search, page = 1, limit = 20, sort } = query || {};
  
      const queryBuilder = this.associateRepository
        .createQueryBuilder('associate')
        .leftJoinAndSelect('associate.persona', 'persona');
  
      // Filtrar por estado
      if (status) {
        queryBuilder.andWhere('associate.estado = :status', { status });
      }
  
      // Búsqueda por nombre, cédula o email
      if (search) {
        queryBuilder.andWhere(
          '(persona.nombre ILIKE :search OR persona.apellido1 ILIKE :search OR persona.apellido2 ILIKE :search OR persona.cedula ILIKE :search OR persona.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }
  
      // Ordenamiento
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
  
      // Paginación
      queryBuilder.skip((page - 1) * limit).take(limit);
  
      const [data, total] = await queryBuilder.getManyAndCount();
  
      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async findOne(id: number): Promise<Associate> {
      const associate = await this.associateRepository.findOne({
        where: { idAsociado: id },
        relations: ['persona'],
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
  
      // Actualizar datos de persona si vienen
      if (updateDto.persona) {
        // Verificar email único si se está actualizando
        if (
          updateDto.persona.email &&
          updateDto.persona.email !== associate.persona.email
        ) {
          const existingByEmail = await this.personaRepository.findOne({
            where: { email: updateDto.persona.email },
          });
  
          if (existingByEmail) {
            throw new ConflictException(
              `Ya existe una persona con el email ${updateDto.persona.email}`,
            );
          }
        }
  
        await this.personaRepository.update(
          associate.persona.idPersona,
          updateDto.persona,
        );
      }
  
      // Actualizar datos de asociado
      Object.assign(associate, {
        distanciaFinca: updateDto.distanciaFinca ?? associate.distanciaFinca,
        viveEnFinca: updateDto.viveEnFinca ?? associate.viveEnFinca,
        marcaGanado: updateDto.marcaGanado ?? associate.marcaGanado,
        CVO: updateDto.CVO ?? associate.CVO,
        estado: updateDto.estado ?? associate.estado,
        motivoRechazo: updateDto.motivoRechazo ?? associate.motivoRechazo,
      });
  
      return this.associateRepository.save(associate);
    }
  
    async changeStatus(
        id: number,
        changeStatusDto: ChangeStatusDto,
      ): Promise<Associate> {
        const associate = await this.findOne(id);
      
        // Validar que si el estado es RECHAZADO, venga el motivo
        if (
          changeStatusDto.estado === AssociateStatus.RECHAZADO &&
          !changeStatusDto.motivo
        ) {
          throw new BadRequestException(
            'El motivo es obligatorio cuando se rechaza una solicitud',
          );
        }
      
        associate.estado = changeStatusDto.estado;
        
        // Corrección del tipo: asegurarse de que sea string | undefined
        associate.motivoRechazo =
          changeStatusDto.estado === AssociateStatus.RECHAZADO
            ? (changeStatusDto.motivo ?? undefined) // Convertir null a undefined
            : undefined; // Si no es rechazado, limpiar el motivo
      
        return this.associateRepository.save(associate);
      }
  
    async remove(id: number): Promise<void> {
      const associate = await this.findOne(id);
      await this.associateRepository.remove(associate);
    }
  
    // Métodos útiles para estadísticas
    async getStatsByStatus() {
      return this.associateRepository
        .createQueryBuilder('associate')
        .select('associate.estado', 'estado')
        .addSelect('COUNT(*)', 'count')
        .groupBy('associate.estado')
        .getRawMany();
    }
  
    async countByStatus(status: AssociateStatus): Promise<number> {
      return this.associateRepository.count({
        where: { estado: status },
      });
    }
  }