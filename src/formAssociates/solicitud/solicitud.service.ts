import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { ChangeSolicitudStatusDto } from './dto/change-solicitud-status.dto';
import { SolicitudStatus } from './dto/solicitud-status.enum';
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { DataSource } from 'typeorm';
import { Geografia } from 'src/formFinca/geografia/entities/geografia.entity';
import { NucleoFamiliar } from 'src/formAssociates/nucleo-familiar/entities/nucleo-familiar.entity';
import { Propietario } from '../propietario/entities/propietario.entity';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectRepository(Solicitud)
    private solicitudRepository: Repository<Solicitud>,
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateSolicitudDto): Promise<Solicitud> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // 1. Validaciones duplicados (igual)
  
      // 2. Crear Persona del Asociado
      const personaAsociado = queryRunner.manager.create(Persona, createDto.persona);
      await queryRunner.manager.save(personaAsociado);
  
      // 3. Crear NucleoFamiliar (igual)
      let nucleoFamiliar: NucleoFamiliar | null = null;
      if (createDto.nucleoFamiliar) {
        const nucleoTotal =
          createDto.nucleoFamiliar.nucleoHombres +
          createDto.nucleoFamiliar.nucleoMujeres;
  
        nucleoFamiliar = queryRunner.manager.create(NucleoFamiliar, {
          nucleoHombres: createDto.nucleoFamiliar.nucleoHombres,
          nucleoMujeres: createDto.nucleoFamiliar.nucleoMujeres,
          nucleoTotal: nucleoTotal,
        });
        await queryRunner.manager.save(nucleoFamiliar);
      }
  
      // 4. Crear Asociado
      const asociado = queryRunner.manager.create(Associate, {
        persona: personaAsociado,
        viveEnFinca: createDto.datosAsociado.viveEnFinca,
        marcaGanado: createDto.datosAsociado.marcaGanado,
        CVO: createDto.datosAsociado.CVO,
        esPropietario: createDto.datosAsociado.esPropietario,
        estado: false,
      });
  
      if (nucleoFamiliar) {
        asociado.nucleoFamiliar = nucleoFamiliar;
      }
  
      await queryRunner.manager.save(asociado);
  
      let propietario: Propietario | null = null;

      if (!createDto.datosAsociado.esPropietario) {
        if (!createDto.propietario) {
          throw new BadRequestException(
            'Se requieren los datos del propietario cuando el asociado no es propietario de la finca'
          );
        }

        // Validar que no exista otra persona con esa cédula
        const existePropietario = await queryRunner.manager.findOne(Persona, {
          where: { cedula: createDto.propietario.persona.cedula },
        });

        if (existePropietario) {
          throw new ConflictException(
            `Ya existe una persona con la cédula ${createDto.propietario.persona.cedula}`
          );
        }

        // Crear Persona del Propietario
        const personaPropietario = queryRunner.manager.create(
          Persona,
          createDto.propietario.persona
        );
        await queryRunner.manager.save(personaPropietario);

        // Crear Propietario
        propietario = queryRunner.manager.create(Propietario, {
          persona: personaPropietario,
        });
        await queryRunner.manager.save(propietario);
      }

      // 6. Geografia (igual)
      let geografia = await queryRunner.manager.findOne(Geografia, {
        where: {
          provincia: createDto.datosFinca.geografia.provincia,
          canton: createDto.datosFinca.geografia.canton,
          distrito: createDto.datosFinca.geografia.distrito,
        },
      });

      if (!geografia) {
        geografia = queryRunner.manager.create(Geografia, {
          provincia: createDto.datosFinca.geografia.provincia,
          canton: createDto.datosFinca.geografia.canton,
          distrito: createDto.datosFinca.geografia.distrito,
          caserio: createDto.datosFinca.geografia.caserio,
        });
        await queryRunner.manager.save(geografia);
      }

      // 7. Crear Finca
      const finca = queryRunner.manager.create(Finca, {
        nombre: createDto.datosFinca.nombre,
        areaHa: createDto.datosFinca.areaHa,
        numeroPlano: createDto.datosFinca.numeroPlano,
        idAsociado: asociado.idAsociado,
        geografia: geografia,
      });
      if (propietario) {
        finca.propietario = propietario;
      }
      await queryRunner.manager.save(finca);
  
      // 8. Crear Solicitud
      const solicitud = queryRunner.manager.create(Solicitud, {
        persona: personaAsociado,
        asociado,
        fechaSolicitud: new Date(),
        estado: SolicitudStatus.PENDIENTE,
      });
      await queryRunner.manager.save(solicitud);
  
      await queryRunner.commitTransaction();
      return this.findOne(solicitud.idSolicitud);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllPaginated(params: {
    estado?: SolicitudStatus;
    search?: string;
    page: number;
    limit: number;
    sort?: string;
  }) {
    const { estado, search, page, limit, sort } = params;

    const queryBuilder = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.asociado', 'asociado')
      .leftJoinAndSelect('asociado.nucleoFamiliar', 'nucleoFamiliar')
      .leftJoinAndSelect('asociado.fincas', 'fincas')
      .leftJoinAndSelect('fincas.propietario', 'propietario')
      .leftJoinAndSelect('fincas.geografia', 'geografia');

    if (estado) {
      queryBuilder.andWhere('solicitud.estado = :estado', { estado });
    }

    if (search) {
      queryBuilder.andWhere(
        '(persona.cedula LIKE :search OR persona.nombre LIKE :search OR persona.apellido1 LIKE :search OR persona.apellido2 LIKE :search OR persona.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sort) {
      const [field, order] = sort.split(':');
      const orderDirection = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`solicitud.${field}`, orderDirection);
    } else {
      queryBuilder.orderBy('solicitud.createdAt', 'DESC');
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

  async findAll() {
    return this.solicitudRepository.find({
      relations: ['asociado', 'asociado.nucleoFamiliar', 'asociado.fincas', 'asociado.propietario', 'asociado.fincas.geografia'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { idSolicitud: id },
      relations: [
        'asociado',
        'asociado.persona',
        'asociado.nucleoFamiliar',
        'asociado.fincas',
        'asociado.propietario',
        'asociado.fincas.geografia',
      ],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  async changeStatus(
    id: number,
    changeStatusDto: ChangeSolicitudStatusDto,
  ): Promise<Solicitud> {
    const solicitud = await this.findOne(id);
  
    if (
      changeStatusDto.estado === SolicitudStatus.RECHAZADO &&
      !changeStatusDto.motivo
    ) {
      throw new BadRequestException(
        'El motivo es obligatorio cuando se rechaza una solicitud',
      );
    }
  
    if (solicitud.estado !== SolicitudStatus.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden procesar solicitudes pendientes',
      );
    }
  
    solicitud.estado = changeStatusDto.estado;
    solicitud.fechaResolucion = new Date();
    solicitud.motivo =
      changeStatusDto.estado === SolicitudStatus.RECHAZADO
        ? changeStatusDto.motivo
        : undefined;
  
    await this.solicitudRepository.save(solicitud);
  
    // ✅ IMPORTANTE: Activar el asociado cuando se aprueba
    if (changeStatusDto.estado === SolicitudStatus.APROBADO) {
      solicitud.asociado.estado = true;
      await this.associateRepository.save(solicitud.asociado);
    }
  
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado === SolicitudStatus.APROBADO) {
      throw new BadRequestException(
        'No se puede eliminar una solicitud aprobada',
      );
    }

    if (solicitud.asociado) {
      await this.associateRepository.remove(solicitud.asociado);
    }

    await this.solicitudRepository.remove(solicitud);
  }

  async findByStatus(status: SolicitudStatus) {
    return this.solicitudRepository.find({
      where: { estado: status },
      relations: ['persona', 'asociado', 'asociado.fincas'],
      order: { createdAt: 'DESC' },
    });
  }

  async countByStatus(status: SolicitudStatus): Promise<number> {
    return this.solicitudRepository.count({
      where: { estado: status },
    });
  }

  async getStats() {
    const total = await this.solicitudRepository.count();
    const pendientes = await this.countByStatus(SolicitudStatus.PENDIENTE);
    const aprobadas = await this.countByStatus(SolicitudStatus.APROBADO);
    const rechazadas = await this.countByStatus(SolicitudStatus.RECHAZADO);

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
    };
  }
}

