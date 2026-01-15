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
import { DropboxService } from 'src/dropbox/dropbox.service';
import { EmailService } from 'src/email/email.service';

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
  ) {}

 async create(
  createSolicitudDto: CreateSolicitudVoluntariadoDto,
): Promise<SolicitudVoluntariado> {
  return this.dataSource.transaction(async (manager) => {
    let voluntario: VoluntarioIndividual | undefined;
    let organizacion: Organizacion | undefined;

    // Helpers seguros
    const disponibilidades = createSolicitudDto.disponibilidades ?? [];
    const areasInteres = createSolicitudDto.areasInteres ?? [];
    const representantes = createSolicitudDto.representantes ?? [];
    const razonesSociales = createSolicitudDto.razonesSociales ?? [];

    // Crear según el tipo de solicitante
    if (createSolicitudDto.tipoSolicitante === 'INDIVIDUAL') {
      if (!createSolicitudDto.voluntario) {
        throw new BadRequestException(
          'Debe proporcionar los datos del voluntario individual',
        );
      }

      // 1) Crear voluntario
      voluntario = await this.voluntarioService.createInTransaction(
        createSolicitudDto.voluntario,
        manager,
      );

      // 2) Crear disponibilidades EN PARALELO
      if (disponibilidades.length > 0) {
        await Promise.all(
          disponibilidades.map((disponibilidadDto) =>
            this.disponibilidadService.createForVoluntarioInTransaction(
              disponibilidadDto,
              voluntario!,
              manager,
            ),
          ),
        );
      }

      // 3) Crear áreas de interés EN PARALELO
      if (areasInteres.length > 0) {
        await Promise.all(
          areasInteres.map((areaInteresDto) =>
            this.areasInteresService.createForVoluntarioInTransaction(
              areaInteresDto,
              voluntario!,
              manager,
            ),
          ),
        );
      }
    } else if (createSolicitudDto.tipoSolicitante === 'ORGANIZACION') {
      if (!createSolicitudDto.organizacion) {
        throw new BadRequestException(
          'Debe proporcionar los datos de la organización',
        );
      }

      // 1) Crear organización
      organizacion = await this.organizacionService.createInTransaction(
        createSolicitudDto.organizacion,
        manager,
      );

      // 2) Crear representantes EN PARALELO
      if (representantes.length > 0) {
        await Promise.all(
          representantes.map((representanteDto) =>
            this.representanteService.createInTransaction(
              representanteDto,
              organizacion!,
              manager,
            ),
          ),
        );
      }

      // 3) Crear razones sociales EN PARALELO
      if (razonesSociales.length > 0) {
        await Promise.all(
          razonesSociales.map((razonSocialDto) =>
            this.razonSocialService.createInTransaction(
              razonSocialDto,
              organizacion!,
              manager,
            ),
          ),
        );
      }

      // 4) Crear disponibilidades EN PARALELO
      if (disponibilidades.length > 0) {
        await Promise.all(
          disponibilidades.map((disponibilidadDto) =>
            this.disponibilidadService.createForOrganizacionInTransaction(
              disponibilidadDto,
              organizacion!,
              manager,
            ),
          ),
        );
      }

      // 5) Crear áreas de interés EN PARALELO
      if (areasInteres.length > 0) {
        await Promise.all(
          areasInteres.map((areaInteresDto) =>
            this.areasInteresService.createForOrganizacionInTransaction(
              areaInteresDto,
              organizacion!,
              manager,
            ),
          ),
        );
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
  files: { cv?: any[]; cedula?: any[]; carta?: any[] },
): Promise<any> {
  const t0 = Date.now();
  const solicitud = await this.solicitudRepository.findOne({
    where: { idSolicitudVoluntariado: idSolicitud },
    relations: ['voluntario.persona', 'organizacion'],
  });
console.log("findOne ms:", Date.now() - t0);

  if (!solicitud) {
    throw new NotFoundException(`Solicitud con ID ${idSolicitud} no encontrada`);
  }

  const formData = {
    cv: [] as string[],
    cedula: [] as string[],
    carta: [] as string[],
  };

  try {
    let nombreCarpeta: string;

    if (solicitud.tipoSolicitante === 'INDIVIDUAL' && solicitud.voluntario?.persona) {
      const p = solicitud.voluntario.persona;
      nombreCarpeta = `${p.nombre}-${p.apellido1}-${p.cedula}`.toLowerCase().replace(/\s+/g, '-');
    } else if (solicitud.tipoSolicitante === 'ORGANIZACION' && solicitud.organizacion) {
      nombreCarpeta = `${solicitud.organizacion.nombre}`.toLowerCase().replace(/\s+/g, '-');
    } else {
      throw new BadRequestException('No se puede determinar el nombre de la carpeta');
    }

    // (Opcional) si vas a asumir que existen, dejalas comentadas
    // await this.dropboxService.ensureFolder('/Solicitudes Voluntarios');
    // await this.dropboxService.ensureFolder(`/Solicitudes Voluntarios/${nombreCarpeta}`);

    const mkPath = (kind: "cv" | "cedula" | "carta") =>
      `/Solicitudes Voluntarios/${nombreCarpeta}/${kind}`;

    const uploads: Array<Promise<void>> = [];

    if (files.cv?.length) {
      uploads.push(
        Promise.all(
          files.cv.map(async (file) => {
            const path = await this.dropboxService.uploadFile(file, mkPath("cv"));
            formData.cv.push(path);
          })
        ).then(() => void 0)
      );
    }

    if (files.cedula?.length) {
      uploads.push(
        Promise.all(
          files.cedula.map(async (file) => {
            const path = await this.dropboxService.uploadFile(file, mkPath("cedula"));
            formData.cedula.push(path);
          })
        ).then(() => void 0)
      );
    }

    if (files.carta?.length) {
      uploads.push(
        Promise.all(
          files.carta.map(async (file) => {
            const path = await this.dropboxService.uploadFile(file, mkPath("carta"));
            formData.carta.push(path);
          })
        ).then(() => void 0)
      );
    }
const t1 = Date.now();
    await Promise.all(uploads);
console.log("dropbox uploads ms:", Date.now() - t1);

    solicitud.formData = formData;
    solicitud.cvUrlTemp = formData.cv[0] ?? undefined;
    solicitud.cedulaUrlTemp = formData.cedula[0] ?? undefined;
    solicitud.cartaUrlTemp = formData.carta[0] ?? undefined;
const t2 = Date.now();
    await this.solicitudRepository.save(solicitud);
console.log("db save ms:", Date.now() - t2);
    return { message: 'Documentos subidos exitosamente', urls: formData };
  } catch (error: any) {
    console.error('[Service] Error al subir documentos:', error.message);
    throw new BadRequestException(`Error al subir documentos: ${error.message}`);
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
}