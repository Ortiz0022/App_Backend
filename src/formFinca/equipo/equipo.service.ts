import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Finca } from '../finca/entities/finca.entity';
import { InfraestructuraProduccion } from './entities/equipo.entity';
import { CreateInfraestructuraProduccionDto } from './dto/create-equipo.dto';
import { UpdateInfraestructuraProduccionDto } from './dto/update-equipo.dto';

@Injectable()
export class InfraestructuraProduccionService {
  constructor(
    @InjectRepository(InfraestructuraProduccion)
    private readonly repo: Repository<InfraestructuraProduccion>,
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,
  ) {}

  async create(dto: CreateInfraestructuraProduccionDto): Promise<InfraestructuraProduccion> {
    const finca = await this.fincaRepo.findOne({ where: { idFinca: dto.idFinca } });
    if (!finca) throw new NotFoundException(`Finca con ID ${dto.idFinca} no encontrada`);

    // Verificar que la finca no tenga ya infraestructura
    const existente = await this.repo.findOne({ where: { finca: { idFinca: dto.idFinca } } });
    if (existente) {
      throw new ConflictException('Esta finca ya tiene infraestructura registrada');
    }

    const infraestructura = this.repo.create({
      numeroAparatos: dto.numeroAparatos,
      numeroBebederos: dto.numeroBebederos,
      numeroSaleros: dto.numeroSaleros,
      finca,
    });

    return this.repo.save(infraestructura);
  }

  async findByFinca(idFinca: number): Promise<InfraestructuraProduccion | null> {
    return this.repo.findOne({ where: { finca: { idFinca } } });
  }

  async findOne(id: number): Promise<InfraestructuraProduccion> {
    const item = await this.repo.findOne({ where: { idInfraestructura: id } });
    if (!item) throw new NotFoundException(`Infraestructura con ID ${id} no encontrada`);
    return item;
  }

  async update(id: number, dto: UpdateInfraestructuraProduccionDto): Promise<InfraestructuraProduccion> {
    const infraestructura = await this.findOne(id);
    Object.assign(infraestructura, dto);
    return this.repo.save(infraestructura);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }

  // ✅ Método transaccional (para SolicitudService)
  async createInTransaction(
    dto: CreateInfraestructuraProduccionDto,
    finca: Finca,
    manager: EntityManager,
  ): Promise<InfraestructuraProduccion> {
    const infraestructura = manager.create(InfraestructuraProduccion, {
      numeroAparatos: dto.numeroAparatos,
      numeroBebederos: dto.numeroBebederos,
      numeroSaleros: dto.numeroSaleros,
      finca,
    });

    return manager.save(infraestructura);
  }
}