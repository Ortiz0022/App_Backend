import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, EntityManager } from 'typeorm';
import { Finca } from './entities/finca.entity';
import { UpdateFincaDto } from './dto/update-finca.dto';
import { QueryFincaDto } from './dto/query-finca.dto';
import { AssociateService } from '../../formAssociates/associate/associate.service';
import { Geografia } from '../geografia/entities/geografia.entity';
import { Propietario } from '../../formAssociates/propietario/entities/propietario.entity';
import { CreateFincaDto } from './dto/create-finca.dto';
import { CreateFincaTransactionDto } from './dto/create-finca-transaction';
import { Animal } from '../animal/entities/animal.entity';
import { Forraje } from '../forraje/entities/forraje.entity';
import { FuenteAgua } from '../fuente-agua/entities/fuente-agua.entity';
import { MetodoRiego } from '../metodo-riego/entities/metodo-riego.entity';
import { ActividadAgropecuaria } from '../actividad-agropecuaria/entities/actividad.entity';
import { InfraestructuraProduccion } from '../equipo/entities/equipo.entity';
import { FincaOtroEquipo } from '../otros-equipos/entities/finca-equipo.entity';
import { FincaTipoCerca } from '../finca-tipo-cerca/entities/finca-tipo-cerca.entity';
import { FincaInfraestructura } from '../finca-infraestructura/entities/fincaInfraestructura.entity';
import { Inject, forwardRef } from '@nestjs/common';
import { CorrienteElectrica } from '../corriente-electrica/entities/corriente.entity';

@Injectable()
export class FincaService {
  constructor(
    @InjectRepository(Finca)
    private readonly repo: Repository<Finca>,
    @Inject(forwardRef(() => AssociateService))
    private readonly associatesService: AssociateService,
  ) {}

  async create(dto: CreateFincaDto): Promise<Finca> {
    await this.associatesService.findOne(dto.idAsociado);
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  createInTransaction(
    dto: CreateFincaTransactionDto,
    data: {
      idAsociado: number;
      geografia?: Geografia;
      propietario?: Propietario;
      corriente?: CorrienteElectrica; // ✅ AGREGAR
    },
    manager: EntityManager,
  ): Promise<Finca> {
    const finca = manager.create(Finca, {
      nombre: dto.nombre,
      areaHa: dto.areaHa,
      numeroPlano: dto.numeroPlano,
      idAsociado: data.idAsociado,
      geografia: data.geografia,
      propietario: data.propietario,
      corriente: data.corriente, // ✅ AGREGAR
    });
  
    return manager.save(finca);
  }
  async findAll(query: QueryFincaDto): Promise<Finca[]> {
    const where: any = {};
    if (query.idAsociado) {
      where.idAsociado = query.idAsociado;
    }

    if (query.search) {
      const needle = ILike(`%${query.search}%`);
      return this.repo.find({
        where: [
          { ...where, nombre: needle },
          { ...where, numeroPlano: needle },
        ],
        relations: [
          'asociado',
          'asociado.persona',
          'geografia',
          'propietario',
          'propietario.persona',
          'corriente', // ✅ AGREGAR
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return this.repo.find({
      where,
      relations: [
        'asociado',
        'asociado.persona',
        'geografia',
        'propietario',
        'propietario.persona',
        'corriente', // ✅ AGREGAR
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Finca> {
    const finca = await this.repo.findOne({
      where: { idFinca: id },
      relations: [
        'asociado',
        'asociado.persona',
        'geografia',
        'propietario',
        'propietario.persona',
        'hato',
        'registrosProductivos',
        'corriente',
      ],
    });

    if (!finca) throw new NotFoundException(`Finca con ID ${id} no encontrada`);
    return finca;
  }

  async findOneDetailed(id: number): Promise<Finca> {
    const finca = await this.repo.findOne({
      where: { idFinca: id },
      relations: [
        'asociado',
        'asociado.persona',
        'asociado.nucleoFamiliar',
        'propietario',
        'propietario.persona',
        'geografia',
        'registrosProductivos',
        'hato',
        'corriente',
      ],
    });
  
    if (!finca) throw new NotFoundException(`Finca con ID ${id} no encontrada`);
  
    // ✅ Cargar relaciones adicionales por separado
    if (finca.hato) {
      finca.hato.animales = await this.repo.manager.find(Animal, {
        where: { hato: { idHato: finca.hato.idHato } },
        order: { nombre: 'ASC' },
      });
    }
  
    finca.forrajes = await this.repo.manager.find(Forraje, {
      where: { finca: { idFinca: id } },
      order: { tipoForraje: 'ASC' },
    });
  
    finca.fuentesAgua = await this.repo.manager.find(FuenteAgua, {
      where: { finca: { idFinca: id } },
      order: { nombre: 'ASC' },
    });
  
    finca.metodosRiego = await this.repo.manager.find(MetodoRiego, {
      where: { finca: { idFinca: id } },
      order: { nombre: 'ASC' },
    });
  
    finca.actividades = await this.repo.manager.find(ActividadAgropecuaria, {
      where: { finca: { idFinca: id } },
      order: { nombre: 'ASC' },
    });
  
    // ✅ Asignar null explícitamente si no existe
    const infraestructura = await this.repo.manager.findOne(InfraestructuraProduccion, {
      where: { finca: { idFinca: id } },
    });
    finca.infraestructura = infraestructura || undefined;
  
    finca.otrosEquipos = await this.repo.manager.find(FincaOtroEquipo, {
      where: { finca: { idFinca: id } },
      order: { nombreEquipo: 'ASC' },
    });
  
    finca.tipoCercaLinks = await this.repo.manager.find(FincaTipoCerca, {
      where: { finca: { idFinca: id } },
      relations: ['tipoCerca'],
    });
  
    finca.infraLinks = await this.repo.manager.find(FincaInfraestructura, {
      where: { finca: { idFinca: id } },
      relations: ['infraestructura'],
    });
  
    return finca;
  }

  async findByAssociate(idAsociado: number): Promise<Finca[]> {
  await this.associatesService.findOne(idAsociado);

  const fincas = await this.repo.find({
    where: { idAsociado },
    relations: [
      'geografia',
      'propietario',
      'propietario.persona',
      'hato',
      'registrosProductivos',
      'corriente', // ✅ AGREGAR
    ],
    order: { nombre: 'ASC' },
  });

  // Cargar detalles de cada finca por separado
  for (const finca of fincas) {
    if (finca.hato) {
      finca.hato.animales = await this.repo.manager.find(Animal, {
        where: { hato: { idHato: finca.hato.idHato } },
      });
    }

    finca.forrajes = await this.repo.manager.find(Forraje, {
      where: { finca: { idFinca: finca.idFinca } },
    });

    finca.fuentesAgua = await this.repo.manager.find(FuenteAgua, {
      where: { finca: { idFinca: finca.idFinca } },
    });

    finca.metodosRiego = await this.repo.manager.find(MetodoRiego, {
      where: { finca: { idFinca: finca.idFinca } },
    });

    finca.actividades = await this.repo.manager.find(ActividadAgropecuaria, {
      where: { finca: { idFinca: finca.idFinca } },
    });

    // ✅ Manejar infraestructura nullable
    const infraestructura = await this.repo.manager.findOne(InfraestructuraProduccion, {
      where: { finca: { idFinca: finca.idFinca } },
    });
    finca.infraestructura = infraestructura || undefined;

    finca.otrosEquipos = await this.repo.manager.find(FincaOtroEquipo, {
      where: { finca: { idFinca: finca.idFinca } },
    });

    finca.tipoCercaLinks = await this.repo.manager.find(FincaTipoCerca, {
      where: { finca: { idFinca: finca.idFinca } },
      relations: ['tipoCerca'],
    });

    finca.infraLinks = await this.repo.manager.find(FincaInfraestructura, {
      where: { finca: { idFinca: finca.idFinca } },
      relations: ['infraestructura'],
    });
  }

  return fincas;
}

  async update(id: number, dto: UpdateFincaDto): Promise<Finca> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const finca = await this.findOne(id);

    if (finca.hato) {
      throw new BadRequestException(
        'No se puede eliminar una finca que tiene un hato registrado',
      );
    }

    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Finca no encontrada');
  }

  async getSummary(id: number) {
    const finca = await this.findOne(id);

    const [
      forrajesCount,
      fuentesAguaCount,
      metodosRiegoCount,
      actividadesCount,
      equiposCount,
      infraestructurasCount,
    ] = await Promise.all([
      this.repo.manager.count(Forraje, { where: { finca: { idFinca: id } } }),
      this.repo.manager.count(FuenteAgua, { where: { finca: { idFinca: id } } }),
      this.repo.manager.count(MetodoRiego, { where: { finca: { idFinca: id } } }),
      this.repo.manager.count(ActividadAgropecuaria, { where: { finca: { idFinca: id } } }),
      this.repo.manager.count(FincaOtroEquipo, { where: { finca: { idFinca: id } } }),
      this.repo.manager.count(FincaInfraestructura, { where: { finca: { idFinca: id } } }),
    ]);

    const infraestructura = await this.repo.manager.findOne(InfraestructuraProduccion, {
      where: { finca: { idFinca: id } },
    });

    const tipoCercaLink = await this.repo.manager.findOne(FincaTipoCerca, {
      where: { finca: { idFinca: id } },
      relations: ['tipoCerca'],
    });

    return {
      finca: {
        idFinca: finca.idFinca,
        nombre: finca.nombre,
        areaHa: finca.areaHa,
        numeroPlano: finca.numeroPlano,
      },
      ubicacion: finca.geografia,
      propietario: finca.propietario
        ? {
            persona: finca.propietario.persona,
          }
        : null,
      asociado: {
        idAsociado: finca.asociado.idAsociado,
        persona: finca.asociado.persona,
        marcaGanado: finca.asociado.marcaGanado,
        CVO: finca.asociado.CVO,
      },
      ganado: finca.hato
        ? {
            tipoExplotacion: finca.hato.tipoExplotacion,
            razaPredominante: finca.hato.razaPredominante,
            totalGanado: finca.hato.totalGanado,
          }
        : null,
      estadisticas: {
        forrajes: forrajesCount,
        fuentesAgua: fuentesAguaCount,
        metodosRiego: metodosRiegoCount,
        actividades: actividadesCount,
        equipos: equiposCount,
        infraestructurasDisponibles: infraestructurasCount,
      },
      infraestructura: infraestructura
        ? {
            numeroAparatos: infraestructura.numeroAparatos,
            numeroBebederos: infraestructura.numeroBebederos,
            numeroSaleros: infraestructura.numeroSaleros,
          }
        : null,
      tipoCerca: tipoCercaLink?.tipoCerca || null,
    };
  }
}