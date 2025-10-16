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

import { VoluntarioIndividualService } from '../voluntario-individual/voluntario-individual.service';
import { SolicitudStatus } from './dto/solicitud-voluntariado-status.enum';

@Injectable()
export class SolicitudVoluntariadoService {
  constructor(
    @InjectRepository(SolicitudVoluntariado)
    private solicitudRepository: Repository<SolicitudVoluntariado>,
    private voluntarioService: VoluntarioIndividualService,
    private dataSource: DataSource,
  ) {}

  async create(
    createSolicitudDto: CreateSolicitudVoluntariadoDto,
  ): Promise<SolicitudVoluntariado> {
    return this.dataSource.transaction(async (manager) => {
      // Crear voluntario individual dentro de la transacción
      const voluntario = await this.voluntarioService.createInTransaction(
        createSolicitudDto.voluntario,
        manager,
      );

      // Crear solicitud
      const solicitud = manager.create(SolicitudVoluntariado, {
        tipoSolicitante: createSolicitudDto.tipoSolicitante,
        voluntario,
        fechaSolicitud: new Date(),
        estado: SolicitudStatus.PENDIENTE,
      });

      return manager.save(solicitud);
    });
  }

  async findAll(): Promise<SolicitudVoluntariado[]> {
    return this.solicitudRepository.find({
      relations: ['voluntario', 'voluntario.persona'],
    });
  }

  async findOne(id: number): Promise<SolicitudVoluntariado> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { idSolicitudVoluntariado: id },
      relations: ['voluntario', 'voluntario.persona'],
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