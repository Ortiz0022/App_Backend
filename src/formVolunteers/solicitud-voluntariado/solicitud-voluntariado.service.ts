import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Get,
  Query,
  Res,
  StreamableFile,
  Header,
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
import { DropboxService } from 'src/dropbox/dropbox.service';
import { EmailService } from 'src/email/email.service';
import { SolicitudesVoluntariadoPdfService } from './solicitudes.pdf.service';

@Injectable()
export class SolicitudVoluntariadoService {
  [x: string]: any;
  constructor(
    @InjectRepository(SolicitudVoluntariado)
    private solicitudRepository: Repository<SolicitudVoluntariado>,
    @InjectRepository(VoluntarioIndividual)
    private voluntarioRepository: Repository<VoluntarioIndividual>,
    @InjectRepository(Organizacion)
    private organizacionRepository: Repository<Organizacion>,
    private voluntarioService: VoluntarioIndividualService,
    private organizacionService: OrganizacionService,
    private representanteService: RepresentanteService,
    private razonSocialService: RazonSocialService,
    private disponibilidadService: DisponibilidadService,
    private areasInteresService: AreasInteresService,
    private dropboxService: DropboxService,
    private dataSource: DataSource,
     private emailService: EmailService,
     private readonly solicitudesPdfService: SolicitudesVoluntariadoPdfService,
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
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

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
  if (params.estado) {
    queryBuilder.andWhere('solicitud.estado = :estado', { estado: params.estado });
  }

  // Filtro de búsqueda
  if (params.search) {
    queryBuilder.andWhere(
      '(personaVoluntario.cedula LIKE :search OR personaVoluntario.nombre LIKE :search OR personaVoluntario.apellido1 LIKE :search OR personaVoluntario.apellido2 LIKE :search OR personaVoluntario.email LIKE :search OR organizacion.cedulaJuridica LIKE :search OR organizacion.nombre LIKE :search OR organizacion.email LIKE :search)',
      { search: `%${params.search}%` }
    );
  }

  // Ordenamiento
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
    limit,
    pages: Math.ceil(total / limit),
  };
}

  // ✅ NUEVO: Método para subir documentos a Dropbox
  async uploadDocuments(
    idSolicitud: number,
    files: {
      cv?: any[];
      cedula?: any[];
      carta?: any[];
    },
  ): Promise<any> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { idSolicitudVoluntariado: idSolicitud },
      relations: ['voluntario', 'voluntario.persona', 'organizacion'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${idSolicitud} no encontrada`);
    }

    const formData = {
      cv: [] as string[],
      cedula: [] as string[],
      carta: [] as string[],
    };

    try {
      // Determinar nombre de carpeta según tipo de solicitante
      let nombreCarpeta: string;

      if (solicitud.tipoSolicitante === 'INDIVIDUAL' && solicitud.voluntario?.persona) {
        const persona = solicitud.voluntario.persona;
        nombreCarpeta = `${persona.nombre}-${persona.apellido1}-${persona.cedula}`
          .toLowerCase()
          .replace(/\s+/g, '-');
      } else if (solicitud.tipoSolicitante === 'ORGANIZACION' && solicitud.organizacion) {
        nombreCarpeta = `${solicitud.organizacion.nombre}`
          .toLowerCase()
          .replace(/\s+/g, '-');
      } else {
        throw new BadRequestException('No se puede determinar el nombre de la carpeta');
      }

      // Asegurar que existan las carpetas base
      await this.dropboxService.ensureFolder('/Solicitudes Voluntarios');
      await this.dropboxService.ensureFolder(`/Solicitudes Voluntarios/${nombreCarpeta}`);

      // Subir CV
      if (files.cv && files.cv.length > 0) {
        for (const file of files.cv) {
          const url = await this.dropboxService.uploadFile(
            file,
            `/Solicitudes Voluntarios/${nombreCarpeta}/cv`,
          );
          formData.cv.push(url);
        }
      }

      // Subir Cédula
      if (files.cedula && files.cedula.length > 0) {
        for (const file of files.cedula) {
          const url = await this.dropboxService.uploadFile(
            file,
            `/Solicitudes Voluntarios/${nombreCarpeta}/cedula`,
          );
          formData.cedula.push(url);
        }
      }

      // Subir Carta
      if (files.carta && files.carta.length > 0) {
        for (const file of files.carta) {
          const url = await this.dropboxService.uploadFile(
            file,
            `/Solicitudes Voluntarios/${nombreCarpeta}/carta`,
          );
          formData.carta.push(url);
        }
      }

      // Guardar URLs en formData y también en campos temp
      solicitud.formData = formData;
      solicitud.cvUrlTemp = formData.cv[0] ?? undefined;
      solicitud.cedulaUrlTemp = formData.cedula[0] ?? undefined;
      solicitud.cartaUrlTemp = formData.carta[0] ?? undefined;

      await this.solicitudRepository.save(solicitud);

      return {
        message: 'Documentos subidos exitosamente',
        urls: formData,
      };
    } catch (error: any) {
      console.error('[Service] Error al subir documentos:', error.message);
      throw new BadRequestException(
        `Error al subir documentos: ${error.message}`,
      );
    }
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

  //Si se aprueba, activar el voluntario/organización
  if (changeStatusDto.estado === SolicitudVoluntariadoStatus.APROBADO) {
    if (solicitud.voluntario) {
      // Actualizar voluntario individual
      await this.voluntarioRepository.update(
        solicitud.voluntario.idVoluntario,
        { isActive: true }
      );
      
      // Recargar con el valor actualizado
      solicitud.voluntario = (await this.voluntarioRepository.findOne({
        where: { idVoluntario: solicitud.voluntario.idVoluntario },
        relations: ['persona', 'areasInteres', 'disponibilidades'],
      })) ?? undefined;
    }
   
    // Activar organización al aprobar
    if (solicitud.organizacion) {
      await this.organizacionRepository.update(
        solicitud.organizacion.idOrganizacion,
        { isActive: true }
      );
      
      // Recargar con el valor actualizado
      solicitud.organizacion = (await this.organizacionRepository.findOne({
        where: { idOrganizacion: solicitud.organizacion.idOrganizacion },
        relations: [
          'representantes',
          'representantes.persona',
          'razonesSociales',
          'areasInteres',
          'disponibilidades',
        ],
      })) ?? undefined;
    }
  }

  // Guardar la solicitud actualizada
  const updatedSolicitud = await this.solicitudRepository.save(solicitud);

  await this.sendStatusChangeEmail(updatedSolicitud, changeStatusDto);

  // Si se aprueba, copiar documentos a entidades (asíncrono)
  if (changeStatusDto.estado === SolicitudVoluntariadoStatus.APROBADO) {
    this.copyDocumentsToEntities(updatedSolicitud).catch((err) => {
      console.error('Error copiando documentos:', err);
    });
  }

  // Devolver la solicitud actualizada con todas las relaciones
  return this.findOne(updatedSolicitud.idSolicitudVoluntariado);
}

private async sendStatusChangeEmail(
    solicitud: SolicitudVoluntariado,
    changeStatusDto: ChangeSolicitudVoluntariadoStatusDto,
  ): Promise<void> {
    try {
     let email: string | undefined;
      let nombre: string = ''; // ← INICIALIZAR

      // Obtener email y nombre según el tipo de solicitante
      if (solicitud.tipoSolicitante === 'INDIVIDUAL' && solicitud.voluntario) {
        email = solicitud.voluntario.persona?.email;
        nombre = `${solicitud.voluntario.persona?.nombre} ${solicitud.voluntario.persona?.apellido1}`;
      } else if (solicitud.tipoSolicitante === 'ORGANIZACION' && solicitud.organizacion) {
        email = solicitud.organizacion.email;
        nombre = solicitud.organizacion.nombre;
      }

      if (!email) {
        console.warn(`No se encontró email para la solicitud ${solicitud.idSolicitudVoluntariado}`);
        return;
      }

      // Enviar correo según el estado
      if (changeStatusDto.estado === SolicitudVoluntariadoStatus.APROBADO) {
        await this.emailService.sendApplicationApprovalEmailVolunteers(
          email,
          nombre,
          solicitud.tipoSolicitante,
        );
      } else if (changeStatusDto.estado === SolicitudVoluntariadoStatus.RECHAZADO) {
        await this.emailService.sendApplicationRejectionEmailVolunteers(
          email,
          nombre,
          changeStatusDto.motivo || 'No se especificó un motivo',
          solicitud.tipoSolicitante,
        );
      }
    } catch (error) {
      console.error('Error al enviar correo de notificación:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
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

  // ✅ NUEVO: Método privado para copiar documentos al aprobar
  private async copyDocumentsToEntities(solicitud: SolicitudVoluntariado): Promise<void> {
    // Copiar documentos a VoluntarioIndividual (si existe)
    if (solicitud.voluntario) {
      if (solicitud.cvUrlTemp) {
        solicitud.voluntario.cvUrl = solicitud.cvUrlTemp;
      }
      if (solicitud.cedulaUrlTemp && solicitud.voluntario.persona) {
        solicitud.voluntario.persona.cedulaUrl = solicitud.cedulaUrlTemp;
      }
      if (solicitud.cartaUrlTemp) {
        solicitud.voluntario.cartaUrl = solicitud.cartaUrlTemp;
      }

      await this.voluntarioRepository.save(solicitud.voluntario);
    }

    // Copiar documentos a Organizacion (si existe)
    if (solicitud.organizacion) {
      if (solicitud.cedulaUrlTemp) {
        solicitud.organizacion.documentoLegalUrl = solicitud.cedulaUrlTemp;
      }

      await this.organizacionRepository.save(solicitud.organizacion);
    }
  }

async generarPdfSolicitudVoluntarioIndividual(idSolicitud: number): Promise<Buffer> {
  // 1) Trae solicitud para saber cuál voluntario es
  const solicitud = await this.solicitudRepository.findOne({
    where: { idSolicitudVoluntariado: idSolicitud },
    relations: ['voluntario'], // solo para agarrar el id
  })

  if (!solicitud) {
    throw new NotFoundException(`No existe la solicitud ${idSolicitud}`)
  }
  if (!solicitud.voluntario?.idVoluntario) {
    throw new NotFoundException(`La solicitud ${idSolicitud} no tiene voluntario asociado`)
  }

  // 2) 🔥 RECARGA el voluntario COMPLETO (incluye motivación/habilidades/experiencia)
  const voluntarioFull = await this.voluntarioRepository.findOne({
    where: { idVoluntario: solicitud.voluntario.idVoluntario },
    relations: ['persona', 'areasInteres', 'disponibilidades', 'solicitud'],
  })

  if (!voluntarioFull) {
    throw new NotFoundException(`No existe el voluntario asociado a la solicitud ${idSolicitud}`)
  }

  // ✅ Debug de servidor para confirmar que YA vienen
  console.log('[PDF] voluntarioFull =>', {
    id: voluntarioFull.idVoluntario,
    motivacion: voluntarioFull.motivacion,
    habilidades: voluntarioFull.habilidades,
    experiencia: voluntarioFull.experiencia,
  })

  return this.voluntarioPdfService.generateVoluntarioIndividualPDF(voluntarioFull)
}
}
