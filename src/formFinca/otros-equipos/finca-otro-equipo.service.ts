import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { Finca } from '../finca/entities/finca.entity';
import { FincaOtroEquipo } from './entities/finca-equipo.entity';
import { CreateFincaOtroEquipoDto } from './dto/create-otros-equipos.dto';
import { UpdateFincaOtroEquipoDto } from './dto/update-otros-equipos.dto';

@Injectable()
export class FincaOtroEquipoService {
  constructor(
    @InjectRepository(FincaOtroEquipo)
    private readonly repo: Repository<FincaOtroEquipo>,
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,
  ) {}

  async create(dto: CreateFincaOtroEquipoDto): Promise<FincaOtroEquipo> {
    const finca = await this.fincaRepo.findOne({ where: { idFinca: dto.idFinca } });
    if (!finca) throw new NotFoundException(`Finca con ID ${dto.idFinca} no encontrada`);

    // Verificar duplicado
    const existente = await this.repo.findOne({
      where: {
        finca: { idFinca: dto.idFinca },
        nombreEquipo: dto.nombreEquipo,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Esta finca ya tiene registrado el equipo "${dto.nombreEquipo}"`,
      );
    }

    const fincaEquipo = this.repo.create({
      finca,
      nombreEquipo: dto.nombreEquipo,
      cantidad: dto.cantidad,
    });

    return this.repo.save(fincaEquipo);
  }

  async findAll(): Promise<FincaOtroEquipo[]> {
    return this.repo.find({
      relations: ['finca'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByFinca(idFinca: number): Promise<FincaOtroEquipo[]> {
    return this.repo.find({
      where: { finca: { idFinca } },
      order: { nombreEquipo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<FincaOtroEquipo> {
    const item = await this.repo.findOne({
      where: { idFincaOtroEquipo: id },
      relations: ['finca'],
    });
    if (!item) throw new NotFoundException(`FincaOtroEquipo con ID ${id} no encontrado`);
    return item;
  }

  async update(id: number, dto: UpdateFincaOtroEquipoDto): Promise<FincaOtroEquipo> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }

  // ✅ Método transaccional en batch (para SolicitudService)
  async createManyInTransaction(
    equipos: CreateFincaOtroEquipoDto[],
    finca: Finca,
    manager: EntityManager,
  ): Promise<FincaOtroEquipo[]> {
    if (!equipos || equipos.length === 0) {
      return [];
    }

    const equipoEntities = equipos.map((dto) =>
      manager.create(FincaOtroEquipo, {
        nombreEquipo: dto.nombreEquipo,
        cantidad: dto.cantidad,
        finca,
      }),
    );

    return manager.save(equipoEntities);
  }
}