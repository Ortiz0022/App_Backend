import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Finca } from '../finca/entities/finca.entity';
import { Forraje } from './entities/forraje.entity';
import { CreateForrajeDto } from './dto/create-forraje.dto';

@Injectable()
export class ForrajeService {
  constructor(
    @InjectRepository(Forraje)
    private readonly forrajeRepository: Repository<Forraje>,
    @InjectRepository(Finca)
    private readonly fincaRepository: Repository<Finca>,
  ) {}

  async create(createDto: CreateForrajeDto): Promise<Forraje> {
    const finca = await this.fincaRepository.findOne({
      where: { idFinca: createDto.idFinca },
    });

    if (!finca) {
      throw new NotFoundException(`Finca con ID ${createDto.idFinca} no encontrada`);
    }

    const forraje = this.forrajeRepository.create({
      ...createDto,
      finca,
    });

    return this.forrajeRepository.save(forraje);
  }

  // Método transaccional (para SolicitudService)
  async createManyInTransaction(
    forrajes: CreateForrajeDto[],
    finca: Finca,
    manager: EntityManager,
  ): Promise<Forraje[]> {
    const forrajeEntities = forrajes.map((dto) =>
      manager.create(Forraje, {
        tipoForraje: dto.tipoForraje,
        variedad: dto.variedad,
        hectareas: dto.hectareas,
        utilizacion: dto.utilizacion,
        finca,
      }),
    );

    return manager.save(forrajeEntities);
  }

  async findAll(): Promise<Forraje[]> {
    return this.forrajeRepository.find({
      relations: ['finca'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByFinca(idFinca: number): Promise<Forraje[]> {
    return this.forrajeRepository.find({
      where: { finca: { idFinca } },
      relations: ['finca'],
      order: { tipoForraje: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Forraje> {
    const forraje = await this.forrajeRepository.findOne({
      where: { idForraje: id },
      relations: ['finca'],
    });

    if (!forraje) {
      throw new NotFoundException(`Forraje con ID ${id} no encontrado`);
    }

    return forraje;
  }
}