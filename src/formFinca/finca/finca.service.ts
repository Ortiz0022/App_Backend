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
import { DatosFincaDto } from './dto/finca-data.dto';
import { CreateFincaTransactionDto } from './dto/create-finca-transaction';

@Injectable()
export class FincaService {
  constructor(
    @InjectRepository(Finca)
    private readonly repo: Repository<Finca>,
    private readonly associatesService: AssociateService,
  ) {}

  // Método público (con validaciones)
  async create(dto: CreateFincaDto): Promise<Finca> {
    await this.associatesService.findOne(dto.idAsociado);
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  createInTransaction(
    dto: CreateFincaTransactionDto, // ✅ DTO sin geografia
    data: {
      idAsociado: number;
      geografia?: Geografia;
      propietario?: Propietario;
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
        relations: ['asociado'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.repo.find({
      where,
      relations: ['asociado'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Finca> {
    const finca = await this.repo.findOne({
      where: { idFinca: id },
      relations: [
        'asociado',
        'asociado.persona',
        'propietario',
        'propietario.persona',
        'geografia',
        'registrosProductivos',
        'hato',
        'fincasFuentesEnergia',
        'fincasFuentesEnergia.fuenteEnergia',
        'fincasEquipos.equipo',
        'accesos',
        'metodosRiego',
        'fincaInfraestructuras',
        'fincaInfraestructuras.infraestructura',
        'fincaTiposCerca',
        'fincaTiposCerca.tipoCerca',
        'canalesComercializacion',
        'fuentesAgua',
        'actividadesAgropecuarias',
      ],
    });
    if (!finca) throw new NotFoundException('Finca not found');
    return finca;
  }

  async findByAssociate(idAsociado: number): Promise<Finca[]> {
    await this.associatesService.findOne(idAsociado);
    return this.repo.find({
      where: { idAsociado },
      order: { nombre: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateFincaDto): Promise<Finca> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Finca not found');
  }
}