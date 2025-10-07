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
    private dataSource: DataSource,
    private forrajeService: ForrajeService,
    private registrosProductivosService: RegistrosProductivosService,
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
        // Verificar si ya es asociado
        const existingAsociado = await queryRunner.manager.findOne(Associate, {
          where: { persona: { idPersona: personaAsociado.idPersona } }
        });
        
        if (existingAsociado) {
          throw new ConflictException(
            `Ya existe un asociado con esta cédula o email`
          );
        }
      } else {
        // Crear nueva persona
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
          // Reutilizar persona del asociado
          propietario = await this.propietarioService.createInTransaction(
            personaAsociado,
            queryRunner.manager,
          );
        } else {
          // Buscar o crear persona del propietario
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
  
      // 7. Crear Hato 
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

          // 8. Recalcular total después de crear los animales
          await this.hatoService.updateTotalInTransaction(hato, queryRunner.manager);
        }
      }

      // 8. Crear Forraje (si vienen)
      if (createDto.forrajes && createDto.forrajes.length > 0) {
        await this.forrajeService.createManyInTransaction(
          createDto.forrajes,
          finca,
          queryRunner.manager,
        );
      }

      // 9. Crear Registros Productivos (si vienen)
      if (createDto.registrosProductivos) {
        await this.registrosProductivosService.createInTransaction(
          createDto.registrosProductivos,
          finca,
          queryRunner.manager,
        );
      }

      // 10. Crear Solicitud
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
      .leftJoinAndSelect('fincas.forrajes', 'forrajes');
  
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
      ],
    });
  
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }
  
    return solicitud;
  }

  async changeStatus( id: number, changeStatusDto: ChangeSolicitudStatusDto): Promise<Solicitud> {
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

  // MODIFICADO: Copiar documentos cuando se aprueba
  if (changeStatusDto.estado === SolicitudStatus.APROBADO) {
    solicitud.asociado.estado = true;
    await this.associateRepository.save(solicitud.asociado);
    
    // Copiar documentos de temporal a permanente
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


  async uploadDocuments(
  id: number,
  files: {
    cedula?: Express.Multer.File[];
    planoFinca?: Express.Multer.File[];
  },
) {
  const solicitud = await this.findOne(id);

  if (solicitud.estado !== SolicitudStatus.PENDIENTE) {
    throw new BadRequestException(
      'Solo se pueden subir documentos a solicitudes pendientes',
    );
  }

  const updates: Partial<Solicitud> = {};

  // Subir cédula si existe
  if (files.cedula && files.cedula[0]) {
    const cedulaUrl = await this.dropboxService.uploadFile(
      files.cedula[0],
      `solicitud-${id}/cedula`,
    );
    updates.cedulaUrlTemp = cedulaUrl;
  }

  // Subir plano de finca si existe
  if (files.planoFinca && files.planoFinca[0]) {
    const planoUrl = await this.dropboxService.uploadFile(
      files.planoFinca[0],
      `solicitud-${id}/plano`,
    );
    updates.planoFincaUrlTemp = planoUrl;
  }

  // Actualizar solicitud con las URLs temporales
  await this.solicitudRepository.update(id, updates);

  return this.findOne(id);
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