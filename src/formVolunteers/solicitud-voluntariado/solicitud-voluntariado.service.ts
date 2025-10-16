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
import { SolicitudStatus } from './dto/solicitud-voluntariado-status.enum';
import { RepresentanteService } from '../representante/representante.service';

@Injectable()
export class SolicitudVoluntariadoService {
  constructor(
  @InjectRepository(SolicitudVoluntariado)
    private solicitudRepository: Repository<SolicitudVoluntariado>,
    private voluntarioService: VoluntarioIndividualService,
    private organizacionService: OrganizacionService,
    private representanteService: RepresentanteService,
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
      estado: SolicitudStatus.PENDIENTE,
    });

    return manager.save(solicitud);
  });
}

  async findAll(): Promise<SolicitudVoluntariado[]> {
    return this.solicitudRepository.find({
      relations: ['voluntario', 'voluntario.persona', 'organizacion'],
    });
  }

  async findOne(id: number): Promise<SolicitudVoluntariado> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { idSolicitudVoluntariado: id },
      relations: ['voluntario', 'voluntario.persona', 'organizacion'],
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
      changeStatusDto.estado === SolicitudStatus.RECHAZADO &&
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
}