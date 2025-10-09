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
import { Finca } from 'src/formFinca/finca/entities/finca.entity';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { HatoService } from 'src/formFinca/hato/hato.service';
import { AnimalService } from 'src/formFinca/animal/animal.service';
import { ForrajeService } from 'src/formFinca/forraje/forraje.service';
import { RegistrosProductivosService } from 'src/formFinca/registros-productivos/registros-productivos.service';
import { FuentesAguaService } from 'src/formFinca/fuente-agua/fuente-agua.service';
import { MetodoRiegoService } from 'src/formFinca/metodo-riego/metodo-riego.service';
import { ActividadesAgropecuariasService } from 'src/formFinca/actividad-agropecuaria/actividad.service';
import { FincaOtroEquipoService } from 'src/formFinca/otros-equipos/finca-otro-equipo.service';
import { InfraestructuraProduccionService } from 'src/formFinca/equipo/equipo.service';
import { TiposCercaService } from 'src/formFinca/tipo-cerca/tipo-cerca.service';
import { FincaTipoCercaService } from 'src/formFinca/finca-tipo-cerca/finca-tipo-cerca.service';
import { InfraestructurasService } from 'src/formFinca/infraestructura/infraestructura.service';
import { FincaInfraestructurasService } from 'src/formFinca/finca-infraestructura/fincaInfraestructura.service';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectRepository(Solicitud)
    private solicitudRepository: Repository<Solicitud>,
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
    @InjectRepository(Persona)            
    private personaRepository: Repository<Persona>, 
    @InjectRepository(Finca)             
    private fincaRepository: Repository<Finca>,     
    private personaService: PersonaService,
    private nucleoFamiliarService: NucleoFamiliarService, 
    private fincaService: FincaService,
    private geografiaService: GeografiaService,
    private propietarioService: PropietarioService,
    private dropboxService: DropboxService,  
    private hatoService: HatoService,
    private animalService: AnimalService,
    private forrajeService: ForrajeService,
    private registrosProductivosService: RegistrosProductivosService,
    private fuentesAguaService: FuentesAguaService,
    private metodoRiegoService: MetodoRiegoService,
    private actividadesAgropecuariasService: ActividadesAgropecuariasService,
    private infraestructuraProduccionService: InfraestructuraProduccionService,
    private fincaOtroEquipoService: FincaOtroEquipoService,
    private tiposCercaService: TiposCercaService,
    private fincaTipoCercaService: FincaTipoCercaService,
    private infraestructurasService: InfraestructurasService,
    private fincaInfraestructurasService: FincaInfraestructurasService,
    private dataSource: DataSource,

  ) {}

  async create(createDto: CreateSolicitudDto): Promise<Solicitud> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // 1. Buscar o crear Persona del Asociado
      let personaAsociado = await queryRunner.manager.findOne(Persona, {
        where: [
          { cedula: createDto.persona.cedula },
          { email: createDto.persona.email }
        ]
      });
  
      if (personaAsociado) {
        const existingAsociado = await queryRunner.manager.findOne(Associate, {
          where: { persona: { idPersona: personaAsociado.idPersona } }
        });
        
        if (existingAsociado) {
          throw new ConflictException(
            `Ya existe un asociado con esta cédula o email`
          );
        }
      } else {
        personaAsociado = await this.personaService.createInTransaction(
          createDto.persona,
          queryRunner.manager,
        );
      }
  
      // 2. Crear NucleoFamiliar (si viene)
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
  
      // 3. Crear Asociado
      const asociado = queryRunner.manager.create(Associate, {
        persona: personaAsociado,
        viveEnFinca: createDto.datosAsociado.viveEnFinca,
        marcaGanado: createDto.datosAsociado.marcaGanado,
        CVO: createDto.datosAsociado.CVO,
        estado: false,
      });
  
      if (nucleoFamiliar) {
        asociado.nucleoFamiliar = nucleoFamiliar;
      }
  
      await queryRunner.manager.save(asociado);
  
      // 4. Procesar Propietario
      let propietario: Propietario | null = null;
  
      if (createDto.propietario) {
        const esLaMismaPersona = 
          createDto.propietario.persona.cedula === personaAsociado.cedula ||
          createDto.propietario.persona.email === personaAsociado.email;
        
        if (esLaMismaPersona) {
          propietario = await this.propietarioService.createInTransaction(
            personaAsociado,
            queryRunner.manager,
          );
        } else {
          let personaPropietario = await queryRunner.manager.findOne(Persona, {
            where: [
              { cedula: createDto.propietario.persona.cedula },
              { email: createDto.propietario.persona.email }
            ]
          });
  
          if (!personaPropietario) {
            personaPropietario = await this.personaService.createInTransaction(
              createDto.propietario.persona,
              queryRunner.manager,
            );
          }
  
          propietario = await this.propietarioService.createInTransaction(
            personaPropietario,
            queryRunner.manager,
          );
        }
      }
  
      // 5. Geografia
      const geografia = await this.geografiaService.findOrCreateInTransaction(
        createDto.datosFinca.geografia,
        queryRunner.manager,
      );
  
      // 6. Crear Finca
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
  
      // 7. Crear Hato (si viene en el DTO)
      if (createDto.hato) {
        const hato = await this.hatoService.createInTransaction(
          createDto.hato,
          finca,
          queryRunner.manager,
        );

        // 8. Crear Animales (si vienen)
        if (createDto.animales && createDto.animales.length > 0) {
          await this.animalService.createManyInTransaction(
            createDto.animales,
            hato,
            queryRunner.manager,
          );

          // Recalcular total después de crear los animales
          await this.hatoService.updateTotalInTransaction(hato, queryRunner.manager);
        }
      }

      // 9. Crear Forraje (si vienen)
      if (createDto.forrajes && createDto.forrajes.length > 0) {
        await this.forrajeService.createManyInTransaction(
          createDto.forrajes,
          finca,
          queryRunner.manager,
        );
      }

      // 10. Crear Registros Productivos (si vienen)
      if (createDto.registrosProductivos) {
        await this.registrosProductivosService.createInTransaction(
          createDto.registrosProductivos,
          finca,
          queryRunner.manager,
        );
      }

      // 11. Crear Fuentes Agua (si vienen)
      if (createDto.fuentesAgua && createDto.fuentesAgua.length > 0) {
        await this.fuentesAguaService.createManyInTransaction(
          createDto.fuentesAgua,
          finca,
          queryRunner.manager,
        );
      }

      // 12. Crear Metodos Riego (si vienen)
      if (createDto.metodosRiego && createDto.metodosRiego.length > 0) {
        await this.metodoRiegoService.createManyInTransaction(
          createDto.metodosRiego,
          finca,
          queryRunner.manager,
        );
      }

      // 13. Crear Actividades Agropecuarias (si vienen)
      if (createDto.actividades && createDto.actividades.length > 0) {
        await this.actividadesAgropecuariasService.createManyInTransaction(
          createDto.actividades,
          finca,
          queryRunner.manager,
        );
      } 

        // 14. Crear Infraestructura de Producción (si viene)
      if (createDto.infraestructuraProduccion) {
        await this.infraestructuraProduccionService.createInTransaction(
          createDto.infraestructuraProduccion,
          finca,
          queryRunner.manager,
        );
      }

      // 15. Crear Otros Equipos (si vienen)
      if (createDto.otrosEquipos && createDto.otrosEquipos.length > 0) {
        await this.fincaOtroEquipoService.createManyInTransaction(
          createDto.otrosEquipos,
          finca,
          queryRunner.manager,
        );
      }
      
       // 16. ✅ Crear Tipo de Cerca (si viene)
      if (createDto.tipoCerca) {
        const tipoCerca = await this.tiposCercaService.findOrCreateInTransaction(
          createDto.tipoCerca,
          queryRunner.manager,
        );

        await this.fincaTipoCercaService.linkInTransaction(
          {
            idFinca: finca.idFinca,
            idTipoCerca: tipoCerca.idTipoCerca,
          },
          finca,
          tipoCerca,
          queryRunner.manager,
        );
      }

       // 17. Crear Infraestructuras (si vienen)
    if (createDto.infraestructuras && createDto.infraestructuras.length > 0) {
      await this.fincaInfraestructurasService.linkManyInTransaction(
        createDto.infraestructuras,
        finca,
        queryRunner.manager,
      );
    }

      // 18. Crear Solicitud
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
      console.error('❌ Error en transacción:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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
      .leftJoinAndSelect('propietario.persona', 'propietarioPersona')
      .leftJoinAndSelect('fincas.hato', 'hato')
      .leftJoinAndSelect('hato.animales', 'animales')
      .leftJoinAndSelect('fincas.forrajes', 'forrajes')
      .leftJoinAndSelect('fincas.registrosProductivos', 'registrosProductivos')
      .leftJoinAndSelect('fincas.fuentesAgua', 'fuentesAgua')
      .leftJoinAndSelect('fincas.metodosRiego', 'metodosRiego')
      .leftJoinAndSelect('fincas.actividades', 'actividades')
      .leftJoinAndSelect('fincas.fincasEquipos', 'fincasEquipos')
      .leftJoinAndSelect('fincas.infraestructura', 'infraestructura')
      .leftJoinAndSelect('infraestructura.otrosEquipos', 'otrosEquipos')
      .leftJoinAndSelect('infraestructura.tipoCercaLinks', 'tipoCercaLinks')
      .leftJoinAndSelect('infraestructura.tipoCercaLinks.tipoCerca', 'tipoCerca')
      .leftJoinAndSelect('fincas.infraLinks', 'infraLinks')
      .leftJoinAndSelect('infraLinks.infraestructura', 'infraestructura');
  
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
        'persona',
        'asociado',
        'asociado.persona',
        'asociado.nucleoFamiliar',
        'asociado.fincas',
        'asociado.fincas.geografia',
        'asociado.fincas.propietario',
        'asociado.fincas.propietario.persona',
        'asociado.fincas.hato',
        'asociado.fincas.hato.animales',
        'asociado.fincas.forrajes',
        'asociado.fincas.registrosProductivos',
        'asociado.fincas.fuentesAgua',
        'asociado.fincas.metodosRiego',
        'asociado.fincas.actividades',
        'asociado.fincas.infraestructura',   
        'asociado.fincas.otrosEquipos',
        'asociado.fincas.tipoCercaLinks',             
        'asociado.fincas.tipoCercaLinks.tipoCerca',
        'asociado.fincas.infraLinks',
        'asociado.fincas.infraLinks.infraestructura',
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
        'asociado.fincas.hato',
        'asociado.fincas.hato.animales',
        'asociado.fincas.forrajes',
        'asociado.fincas.registrosProductivos',
        'asociado.fincas.fuentesAgua',
        'asociado.fincas.metodosRiego',
        'asociado.fincas.actividades',
        'asociado.fincas.infraestructura',   
      'asociado.fincas.otrosEquipos',
      'asociado.fincas.tipoCercaLinks',           
      'asociado.fincas.tipoCercaLinks.tipoCerca',
      'asociado.fincas.infraLinks',
      'asociado.fincas.infraLinks.infraestructura',
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

    // Copiar documentos y activar asociado cuando se aprueba
    if (changeStatusDto.estado === SolicitudStatus.APROBADO) {
      solicitud.asociado.estado = true;
      await this.associateRepository.save(solicitud.asociado);
      
      await this.copyDocumentsToEntities(solicitud);
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
      relations: [
        'persona',
        'asociado',
        'asociado.persona',
        'asociado.nucleoFamiliar',
        'asociado.fincas',
        'asociado.fincas.geografia',
        'asociado.fincas.propietario',
        'asociado.fincas.propietario.persona',
        'asociado.fincas.hato',
        'asociado.fincas.hato.animales',
        'asociado.fincas.forrajes',
        'asociado.fincas.registrosProductivos',
        'asociado.fincas.fuentesAgua',
        'asociado.fincas.metodosRiego',
        'asociado.fincas.actividades',
        'asociado.fincas.fincasEquipos',
        'asociado.fincas.fincasEquipos.tipoEquipo',
        'asociado.fincas.tipoCercaLinks',           
      'asociado.fincas.tipoCercaLinks.tipoCerca',
      'asociado.fincas.infraLinks',
      'asociado.fincas.infraLinks.infraestructura',
      ],
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

  // ========== MÉTODOS DE DROPBOX ==========

  async uploadDocuments(
  idSolicitud: number,
  files: {
    cedula?: Express.Multer.File[];
    planoFinca?: Express.Multer.File[];
  },
): Promise<any> {
  const solicitud = await this.solicitudRepository.findOne({
    where: { idSolicitud },
    relations: ['persona', 'asociado'],
  });

  if (!solicitud) {
    throw new NotFoundException(`Solicitud con ID ${idSolicitud} no encontrada`);
  }

  const formData = {
    cedula: [] as string[],
    planoFinca: [] as string[],
  };

  try {
    // Asegurar que existan las carpetas base
    await this.dropboxService.ensureFolder('/solicitudes');
    await this.dropboxService.ensureFolder(`/solicitudes/solicitud-${idSolicitud}`);

    // Subir cédulas
    if (files.cedula && files.cedula.length > 0) {
      for (const file of files.cedula) {
        const url = await this.dropboxService.uploadFile(
          file,
          `/solicitudes/solicitud-${idSolicitud}/cedula`,
        );
        formData.cedula.push(url);
      }
    }

    // Subir planos de finca
    if (files.planoFinca && files.planoFinca.length > 0) {
      for (const file of files.planoFinca) {
        const url = await this.dropboxService.uploadFile(
          file,
          `/solicitudes/solicitud-${idSolicitud}/plano`,
        );
        formData.planoFinca.push(url);
      }
    }

    solicitud.formData = formData;
    await this.solicitudRepository.save(solicitud);

    return { 
      message: 'Documentos subidos exitosamente',
      urls: formData 
    };
  } catch (error: any) {
    console.error('[Service] Error al subir documentos:', error.message);
    throw new BadRequestException(
      `Error al subir documentos: ${error.message}`,
    );
  }
}

  private async copyDocumentsToEntities(solicitud: Solicitud): Promise<void> {
    // Copiar cédula a Persona
    if (solicitud.cedulaUrlTemp && solicitud.persona) {
      solicitud.persona.cedulaUrl = solicitud.cedulaUrlTemp;
      await this.personaRepository.save(solicitud.persona);
    }

    // Copiar plano de finca a la primera Finca del asociado
    if (solicitud.planoFincaUrlTemp && solicitud.asociado?.fincas?.[0]) {
      const finca = solicitud.asociado.fincas[0];
      finca.planoFincaUrl = solicitud.planoFincaUrlTemp;
      await this.fincaRepository.save(finca);
    }
  }
}