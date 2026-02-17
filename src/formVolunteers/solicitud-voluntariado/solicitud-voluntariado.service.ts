import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Get,
  Query,
  Res,
  StreamableFile,
  Header,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
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
import { SolicitudesVoluntariadoPdfService } from './reports/solicitudes.pdf.service';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { ValidateSolicitudVoluntariadoDto } from './dto/validate-solicitud-voluntariado.dto';

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
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
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
      // 1) Validar antes de crear nada (misma lógica DRY)
      await this.validateOrThrow(createSolicitudDto, manager);

      let voluntario: VoluntarioIndividual | undefined;
      let organizacion: Organizacion | undefined;

      const disponibilidades = createSolicitudDto.disponibilidades ?? [];
      const areasInteres = createSolicitudDto.areasInteres ?? [];
      const representantes = createSolicitudDto.representantes ?? [];
      const razonesSociales = createSolicitudDto.razonesSociales ?? [];

      if (createSolicitudDto.tipoSolicitante === 'INDIVIDUAL') {
        if (!createSolicitudDto.voluntario) {
          throw new BadRequestException('Debe proporcionar los datos del voluntario individual');
        }

        voluntario = await this.voluntarioService.createInTransaction(
          createSolicitudDto.voluntario,
          manager,
        );

        if (disponibilidades.length > 0) {
          await Promise.all(
            disponibilidades.map((dto) =>
              this.disponibilidadService.createForVoluntarioInTransaction(dto, voluntario!, manager),
            ),
          );
        }

        if (areasInteres.length > 0) {
          await Promise.all(
            areasInteres.map((dto) =>
              this.areasInteresService.createForVoluntarioInTransaction(dto, voluntario!, manager),
            ),
          );
        }
      } else if (createSolicitudDto.tipoSolicitante === 'ORGANIZACION') {
        if (!createSolicitudDto.organizacion) {
          throw new BadRequestException('Debe proporcionar los datos de la organización');
        }

        organizacion = await this.organizacionService.createInTransaction(
          createSolicitudDto.organizacion,
          manager,
        );

        if (representantes.length > 0) {
          await Promise.all(
            representantes.map((dto) =>
              this.representanteService.createInTransaction(dto, organizacion!, manager),
            ),
          );
        }

        if (razonesSociales.length > 0) {
          await Promise.all(
            razonesSociales.map((dto) =>
              this.razonSocialService.createInTransaction(dto, organizacion!, manager),
            ),
          );
        }

        if (disponibilidades.length > 0) {
          await Promise.all(
            disponibilidades.map((dto) =>
              this.disponibilidadService.createForOrganizacionInTransaction(dto, organizacion!, manager),
            ),
          );
        }

        if (areasInteres.length > 0) {
          await Promise.all(
            areasInteres.map((dto) =>
              this.areasInteresService.createForOrganizacionInTransaction(dto, organizacion!, manager),
            ),
          );
        }
      } else {
        throw new BadRequestException('Tipo de solicitante no válido. Debe ser INDIVIDUAL u ORGANIZACION');
      }

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

  async validateBeforeCreate(dto: ValidateSolicitudVoluntariadoDto) {
  await this.validateOrThrow(dto);
  return { ok: true };
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

private async validateOrThrow(
  dto: {
    tipoSolicitante: 'INDIVIDUAL' | 'ORGANIZACION';
    voluntario?: any;
    organizacion?: any;
    cedula?: string;
    cedulaJuridica?: string;
  },
  manager?: EntityManager,
): Promise<void> {
  const solicitudRepo = manager ? manager.getRepository(SolicitudVoluntariado) : this.solicitudRepository;
  const personaRepo = manager ? manager.getRepository(Persona) : this.personaRepository;
  const voluntarioRepo = manager ? manager.getRepository(VoluntarioIndividual) : this.voluntarioRepository;
  const orgRepo = manager ? manager.getRepository(Organizacion) : this.organizacionRepository;

  const tipo = dto.tipoSolicitante;

  // ==========================
  // INDIVIDUAL (ya lo tenés)
  // ==========================
  if (tipo === 'INDIVIDUAL') {
    const cedula = (dto?.voluntario?.persona?.cedula ?? dto?.cedula ?? '').trim();
    if (!cedula) throw new BadRequestException('Debe proporcionar la cédula del voluntario');

    const persona = await personaRepo.findOne({ where: { cedula } });
    if (!persona) return;

    const pendiente = await solicitudRepo
      .createQueryBuilder('s')
      .leftJoin('s.voluntario', 'v')
      .leftJoin('v.persona', 'p')
      .where('s.tipoSolicitante = :tipo', { tipo: 'INDIVIDUAL' })
      .andWhere('s.estado = :estado', { estado: SolicitudVoluntariadoStatus.PENDIENTE })
      .andWhere('p.idPersona = :idPersona', { idPersona: persona.idPersona })
      .getOne();

    if (pendiente) {
      throw new ConflictException({
        code: 'SOLICITUD_PENDIENTE_VOLUNTARIO',
        message: 'Ya llenaste este formulario y tu solicitud de voluntariado está en revisión.',
      });
    }

    const voluntarioExistente = await voluntarioRepo.findOne({
      where: { persona: { idPersona: persona.idPersona } as any },
      relations: ['persona'],
    });

    if (voluntarioExistente?.isActive) {
      const aprobada = await solicitudRepo
        .createQueryBuilder('s')
        .leftJoin('s.voluntario', 'v')
        .leftJoin('v.persona', 'p')
        .where('s.tipoSolicitante = :tipo', { tipo: 'INDIVIDUAL' })
        .andWhere('s.estado = :estado', { estado: SolicitudVoluntariadoStatus.APROBADO })
        .andWhere('p.idPersona = :idPersona', { idPersona: persona.idPersona })
        .getOne();

      if (aprobada) {
        throw new ConflictException({
          code: 'YA_ES_VOLUNTARIO',
          message: 'Ya eres voluntario/a activo/a en el sistema.',
        });
      }
    }

    return;
  }

  // ==========================
  // ORGANIZACION (nuevo)
  // ==========================
  if (tipo === 'ORGANIZACION') {
    const cj = (dto?.organizacion?.cedulaJuridica ?? dto?.cedulaJuridica ?? '').trim();
    if (!cj) throw new BadRequestException('Debe proporcionar la cédula jurídica de la organización');

    // A) pendiente por misma cedula juridica
    const pendienteOrg = await solicitudRepo
      .createQueryBuilder('s')
      .leftJoin('s.organizacion', 'o')
      .where('s.tipoSolicitante = :tipo', { tipo: 'ORGANIZACION' })
      .andWhere('s.estado = :estado', { estado: SolicitudVoluntariadoStatus.PENDIENTE })
      .andWhere('o.cedulaJuridica = :cj', { cj })
      .getOne();

    if (pendienteOrg) {
      throw new ConflictException({
        code: 'SOLICITUD_PENDIENTE_ORG',
        message: 'Esta organización ya envió una solicitud y está en revisión.',
      });
    }

    // B) ya es org activa (org existe + aprobada + isActive)
    const orgExistente = await orgRepo.findOne({ where: { cedulaJuridica: cj } });

    if (orgExistente?.isActive) {
      const aprobadaOrg = await solicitudRepo
        .createQueryBuilder('s')
        .leftJoin('s.organizacion', 'o')
        .where('s.tipoSolicitante = :tipo', { tipo: 'ORGANIZACION' })
        .andWhere('s.estado = :estado', { estado: SolicitudVoluntariadoStatus.APROBADO })
        .andWhere('o.cedulaJuridica = :cj', { cj })
        .getOne();

      if (aprobadaOrg) {
        throw new ConflictException({
          code: 'YA_ES_ORGANIZACION_VOLUNTARIA',
          message: 'Esta organización ya es voluntaria activa en el sistema.',
        });
      }
    }

    return;
  }

  throw new BadRequestException('Tipo de solicitante no válido');
}

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

    const folderMap =
  solicitud.tipoSolicitante === "INDIVIDUAL"
    ? {
        cedula: "cedula",
        cv: "curriculum",
        carta: "carta-recomendacion",
      }
    : {
        cedula: "documento-legal",
        cv: "documento-adicional",
        carta: "carta-motivacion",
      };

const mkPath = (kind: "cv" | "cedula" | "carta") =>
  `/Solicitudes Voluntarios/${nombreCarpeta}/${folderMap[kind]}`;


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
    (!changeStatusDto.motivo || changeStatusDto.motivo.trim().length < 5)
  ) {
     throw new BadRequestException('El motivo es obligatorio al rechazar (mínimo 5 caracteres)');
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
      // documento legal (ahorita viene en cedulaUrlTemp)
      if (solicitud.cedulaUrlTemp) {
        solicitud.organizacion.documentoLegalUrl = solicitud.cedulaUrlTemp;
      }

      if (solicitud.cvUrlTemp) {
        solicitud.organizacion.cvUrl = solicitud.cvUrlTemp;
      }

      if (solicitud.cartaUrlTemp) {
        solicitud.organizacion.cartaUrl = solicitud.cartaUrlTemp;
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
