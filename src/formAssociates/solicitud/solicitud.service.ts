import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { ChangeSolicitudStatusDto } from './dto/change-solicitud-status.dto';
import { SolicitudStatus } from './dto/solicitud-status.enum';
import { Propietario } from '../propietario/entities/propietario.entity';
import { PersonaService } from '../persona/persona.service';
import { NucleoFamiliarService } from '../nucleo-familiar/nucleo-familiar.service';
import { NucleoFamiliar } from '../nucleo-familiar/entities/nucleo-familiar.entity';
import { FincaService } from 'src/formFinca/finca/finca.service';
import { GeografiaService } from 'src/formFinca/geografia/geografia.service';
import { PropietarioService } from '../propietario/propietario.service';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectRepository(Solicitud)
    private solicitudRepository: Repository<Solicitud>,
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
    private personaService: PersonaService,
    private nucleoFamiliarService: NucleoFamiliarService, 
    private fincaService: FincaService,
    private geografiaService: GeografiaService,
    private propietarioService: PropietarioService,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateSolicitudDto): Promise<Solicitud> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar cédula del asociado DENTRO de la transacción
      const existingAsociadoByCedula = await queryRunner.manager.findOne(Persona, {
        where: { cedula: createDto.persona.cedula },
      });

      if (existingAsociadoByCedula) {
        throw new ConflictException(
          `Ya existe una persona con la cédula ${createDto.persona.cedula}`,
        );
      }

      // 2. Crear Persona del Asociado usando PersonaService
      const personaAsociado = await this.personaService.createInTransaction(
        createDto.persona,
        queryRunner.manager,
      );

      // 3. ✅ Crear NucleoFamiliar usando NucleoFamiliarService (si viene)
      let nucleoFamiliar: NucleoFamiliar | null = null; 
      if (createDto.nucleoFamiliar) {
        nucleoFamiliar = await this.nucleoFamiliarService.createInTransaction(
          {
            nucleoHombres: createDto.nucleoFamiliar.nucleoHombres,
            nucleoMujeres: createDto.nucleoFamiliar.nucleoMujeres,
          },
          queryRunner.manager,
        );
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

    // 5. ✅ Crear Propietario usando PropietarioService (si NO es propietario)
      let propietario: Propietario | null = null;

      if (!createDto.datosAsociado.esPropietario) {
        if (!createDto.propietario) {
          throw new BadRequestException(
            'Se requieren los datos del propietario cuando el asociado no es propietario de la finca',
          );
        }

        // Validar cédula del propietario DENTRO de la transacción
        const existingPropietarioByCedula = await queryRunner.manager.findOne(Persona, {
          where: { cedula: createDto.propietario.persona.cedula },
        });

        if (existingPropietarioByCedula) {
          throw new ConflictException(
            `Ya existe una persona con la cédula ${createDto.propietario.persona.cedula}`,
          );
        }

        // Crear Persona del Propietario usando PersonaService
        const personaPropietario = await this.personaService.createInTransaction(
          createDto.propietario.persona,
          queryRunner.manager,
        );

        // ✅ Crear Propietario usando PropietarioService
        propietario = await this.propietarioService.createInTransaction(
          personaPropietario,
          queryRunner.manager,
        );
      }


      // 6. ✅ Geografia usando GeografiaService
        const geografia = await this.geografiaService.findOrCreateInTransaction(
          createDto.datosFinca.geografia,
          queryRunner.manager,
        );
       // 7. ✅ Crear Finca usando FincaService
       const finca = await this.fincaService.createInTransaction(
        {
          nombre: createDto.datosFinca.nombre,
          areaHa: createDto.datosFinca.areaHa,
          numeroPlano: createDto.datosFinca.numeroPlano,
        },
        {
          idAsociado: asociado.idAsociado,
          geografia,
          propietario: propietario || undefined,
        },
        queryRunner.manager,
      );

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

  // ... resto de métodos igual
  async findAllPaginated(params: {
    page?: number;
    limit?: number;
    estado?: string;
    search?: string;
    sort?: string;
  }): Promise<{ items: Solicitud[]; total: number; page: number; pages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.persona', 'persona')
      .leftJoinAndSelect('solicitud.asociado', 'asociado')
      .leftJoinAndSelect('asociado.persona', 'asociadoPersona')
      .leftJoinAndSelect('asociado.nucleoFamiliar', 'nucleoFamiliar')
      .leftJoinAndSelect('asociado.fincas', 'fincas')
      .leftJoinAndSelect('fincas.geografia', 'geografia')
      .leftJoinAndSelect('fincas.propietario', 'propietario')
      .leftJoinAndSelect('propietario.persona', 'propietarioPersona');

    if (params.estado) {
      queryBuilder.andWhere('solicitud.estado = :estado', { estado: params.estado });
    }

    if (params.search) {
      queryBuilder.andWhere(
        '(persona.cedula LIKE :search OR persona.nombre LIKE :search OR persona.email LIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    if (params.sort) {
      const [field, order] = params.sort.split(':');
      queryBuilder.orderBy(`solicitud.${field}`, order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('solicitud.createdAt', 'DESC');
    }

    const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findAll() {
    return this.solicitudRepository.find({
      relations: [
        'asociado',
        'asociado.nucleoFamiliar',
        'asociado.fincas',
        'asociado.fincas.geografia',
        'asociado.fincas.propietario',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { idSolicitud: id },
      relations: [
        'persona',
        'asociado',
        'asociado.persona',
        'asociado.nucleoFamiliar',
        'asociado.fincas',
        'asociado.fincas.geografia',
        'asociado.fincas.propietario',
        'asociado.fincas.propietario.persona',
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