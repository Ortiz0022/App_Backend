import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSolicitudVoluntariadoDto } from './dto/create-solicitud-voluntariado.dto';
import { ChangeSolicitudVoluntariadoStatusDto } from './dto/change-solicitud-voluntariado-status.dto';
import { SolicitudVoluntariado } from './entities/solicitud-voluntariado.entity';
import { VoluntarioIndividual } from '../voluntario-individual/entities/voluntario-individual.entity';
import { Organizacion } from '../organizacion/entities/organizacion.entity';
import { VoluntarioIndividualService } from '../voluntario-individual/voluntario-individual.service';
import { OrganizacionService } from '../organizacion/organizacion.service';
import { RepresentanteService } from '../representante/representante.service';
import { RazonSocialService } from '../razon-social/razon-social.service';
import { DisponibilidadService } from '../disponibilidad/disponibilidad.service';
import { AreasInteresService } from '../areas-interes/areas-interes.service';
import { SolicitudVoluntariadoStatus } from './dto/solicitud-voluntariado-status.enum';

@Injectable()
export class SolicitudVoluntariadoService {
  constructor(
    @InjectRepository(SolicitudVoluntariado)
    private solicitudRepository: Repository<SolicitudVoluntariado>,
    private voluntarioService: VoluntarioIndividualService,
    private organizacionService: OrganizacionService,
    private representanteService: RepresentanteService,
    private razonSocialService: RazonSocialService,
    private disponibilidadService: DisponibilidadService,
    private areasInteresService: AreasInteresService,
    private dataSource: DataSource,
  ) {}

  async create(
    createSolicitudDto: CreateSolicitudVoluntariadoDto,
  ): Promise<SolicitudVoluntariado> {
    return this.dataSource.transaction(async (manager) => {
      let voluntario: VoluntarioIndividual | undefined;
      let organizacion: Organizacion | undefined;

      // Crear según el tipo de solicitante
      if (createSolicitudDto.tipoSolicitante === 'INDIVIDUAL') {
        if (!createSolicitudDto.voluntario) {
          throw new BadRequestException(
            'Debe proporcionar los datos del voluntario individual',
          );
        }
        voluntario = await this.voluntarioService.createInTransaction(
          createSolicitudDto.voluntario,
          manager,
        );

        // Crear disponibilidades para el voluntario
        if (createSolicitudDto.disponibilidades && createSolicitudDto.disponibilidades.length > 0) {
          for (const disponibilidadDto of createSolicitudDto.disponibilidades) {
            await this.disponibilidadService.createForVoluntarioInTransaction(
              disponibilidadDto,
              voluntario,
              manager,
            );
          }
        }

        // Crear áreas de interés para el voluntario
        if (createSolicitudDto.areasInteres && createSolicitudDto.areasInteres.length > 0) {
          for (const areaInteresDto of createSolicitudDto.areasInteres) {
            await this.areasInteresService.createForVoluntarioInTransaction(
              areaInteresDto,
              voluntario,
              manager,
            );
          }
        }
      } else if (createSolicitudDto.tipoSolicitante === 'ORGANIZACION') {
        if (!createSolicitudDto.organizacion) {
          throw new BadRequestException(
            'Debe proporcionar los datos de la organización',
          );
        }
        organizacion = await this.organizacionService.createInTransaction(
          createSolicitudDto.organizacion,
          manager,
        );

        // Crear representantes si existen
        if (createSolicitudDto.representantes && createSolicitudDto.representantes.length > 0) {
          for (const representanteDto of createSolicitudDto.representantes) {
            await this.representanteService.createInTransaction(
              representanteDto,
              organizacion,
              manager,
            );
          }
        }

        // Crear razones sociales si existen
        if (createSolicitudDto.razonesSociales && createSolicitudDto.razonesSociales.length > 0) {
          for (const razonSocialDto of createSolicitudDto.razonesSociales) {
            await this.razonSocialService.createInTransaction(
              razonSocialDto,
              organizacion,
              manager,
            );
          }
        }

        // Crear disponibilidades para la organización
        if (createSolicitudDto.disponibilidades && createSolicitudDto.disponibilidades.length > 0) {
          for (const disponibilidadDto of createSolicitudDto.disponibilidades) {
            await this.disponibilidadService.createForOrganizacionInTransaction(
              disponibilidadDto,
              organizacion,
              manager,
            );
          }
        }

        // Crear áreas de interés para la organización
        if (createSolicitudDto.areasInteres && createSolicitudDto.areasInteres.length > 0) {
          for (const areaInteresDto of createSolicitudDto.areasInteres) {
            await this.areasInteresService.createForOrganizacionInTransaction(
              areaInteresDto,
              organizacion,
              manager,
            );
          }
        }
      } else {
        throw new BadRequestException(
          'Tipo de solicitante no válido. Debe ser INDIVIDUAL u ORGANIZACION',
        );
      }

      // Crear solicitud
      const solicitud = manager.create(SolicitudVoluntariado, {
        tipoSolicitante: createSolicitudDto.tipoSolicitante,
        voluntario,
        organizacion,
        fechaSolicitud: new Date(),
        estado: SolicitudVoluntariadoStatus.PENDIENTE,
      });

      return manager.save(solicitud);
    });
  }

async findAllPaginated(params: {
  page?: number;
  limit?: number;
  estado?: SolicitudVoluntariadoStatus;
  search?: string;
  sort?: string;
}): Promise<{ 
  items: SolicitudVoluntariado[]; 
  total: number; 
  page: number; 
  limit: number;
  pages: number;
}> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const { estado } = params;

  const queryBuilder = this.solicitudRepository
    .createQueryBuilder('solicitud')
    // Voluntario individual
    .leftJoinAndSelect('solicitud.voluntario', 'voluntario')
    .leftJoinAndSelect('voluntario.persona', 'personaVoluntario')
    .leftJoinAndSelect('voluntario.disponibilidades', 'dispVoluntario')
    .leftJoinAndSelect('voluntario.areasInteres', 'areasVoluntario')
    // Organización
    .leftJoinAndSelect('solicitud.organizacion', 'organizacion')
    .leftJoinAndSelect('organizacion.representantes', 'representantes')
    .leftJoinAndSelect('representantes.persona', 'personaRepresentante') 
    .leftJoinAndSelect('organizacion.razonesSociales', 'razones')
    .leftJoinAndSelect('organizacion.disponibilidades', 'dispOrg')
    .leftJoinAndSelect('organizacion.areasInteres', 'areasOrg');

  // Filtro por estado
  if (estado) {
    queryBuilder.andWhere('solicitud.estado = :estado', { estado });
  }

  // Ordenamiento
  queryBuilder.orderBy('solicitud.createdAt', 'DESC');

  // Paginación
  const skip = (page - 1) * limit;
  queryBuilder.skip(skip).take(limit);

  const [items, total] = await queryBuilder.getManyAndCount();

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

  async findAll(): Promise<SolicitudVoluntariado[]> {
    return this.solicitudRepository.find({
      relations: [
        'voluntario',
        'voluntario.persona',
        'voluntario.disponibilidades',
        'voluntario.areasInteres',
        'organizacion',
        'organizacion.representantes',
        'organizacion.representantes.persona',
        'organizacion.razonesSociales',
        'organizacion.disponibilidades',
        'organizacion.areasInteres',
      ],
    });
  }
//
  async findOne(id: number): Promise<SolicitudVoluntariado> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { idSolicitudVoluntariado: id },
      relations: [
        'voluntario',
        'voluntario.persona',
        'voluntario.disponibilidades',
        'voluntario.areasInteres',
        'organizacion',
        'organizacion.representantes',
        'organizacion.representantes.persona',
        'organizacion.razonesSociales',
        'organizacion.disponibilidades',
        'organizacion.areasInteres',
      ],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  async changeStatus(
    id: number,
    changeStatusDto: ChangeSolicitudVoluntariadoStatusDto,
  ): Promise<SolicitudVoluntariado> {
    const solicitud = await this.findOne(id);

    // Validar que el motivo esté presente solo si se rechaza
    if (
      changeStatusDto.estado === SolicitudVoluntariadoStatus.RECHAZADO &&
      !changeStatusDto.motivo
    ) {
      throw new BadRequestException(
        'El motivo es obligatorio al rechazar una solicitud',
      );
    }

    // Actualizar estado y fecha de resolución
    solicitud.estado = changeStatusDto.estado;
    solicitud.fechaResolucion = new Date();

    if (changeStatusDto.motivo) {
      solicitud.motivo = changeStatusDto.motivo;
    }

    return this.solicitudRepository.save(solicitud);
  }

  async remove(id: number): Promise<void> {
    const solicitud = await this.findOne(id);
    await this.solicitudRepository.remove(solicitud);
  }

  async getStats() {
    const [total, pendientes, aprobadas, rechazadas] = await Promise.all([
      this.solicitudRepository.count(),
      this.solicitudRepository.count({
        where: { estado: SolicitudVoluntariadoStatus.PENDIENTE },
      }),
      this.solicitudRepository.count({
        where: { estado: SolicitudVoluntariadoStatus.APROBADO },
      }),
      this.solicitudRepository.count({
        where: { estado: SolicitudVoluntariadoStatus.RECHAZADO },
      }),
    ]);

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
    };
  }
}