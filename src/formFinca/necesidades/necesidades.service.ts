import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Necesidades } from './entities/necesidades.entity';
import { CreateNecesidadesDto } from './dto/create-necesidades.dto';
import { UpdateNecesidadesDto } from './dto/update-necesidades.dto';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';

@Injectable()
export class NecesidadesService {
  constructor(
    @InjectRepository(Necesidades)
    private readonly necesidadesRepository: Repository<Necesidades>,
    @InjectRepository(Associate)
    private readonly associateRepository: Repository<Associate>,
  ) {}

  async create(createDto: CreateNecesidadesDto): Promise<Necesidades> {
    const { idAsociado, orden, descripcion } = createDto;

    const asociado = await this.associateRepository.findOne({
      where: { idAsociado },
    });

    if (!asociado) {
      throw new NotFoundException(`Asociado con ID ${idAsociado} no encontrado`);
    }

    const necesidad = this.necesidadesRepository.create({
      orden,
      descripcion,
      asociado,
    });

    return await this.necesidadesRepository.save(necesidad);
  }

  // ✅ NUEVO: Método transaccional para crear múltiples necesidades
  async createManyInTransaction(
    necesidades: CreateNecesidadesDto[],
    asociado: Associate,
    manager: EntityManager,
  ): Promise<Necesidades[]> {
    if (!necesidades || necesidades.length === 0) {
      return [];
    }

    const necesidadEntities = necesidades.map((dto, index) =>
      manager.create(Necesidades, {
        orden: dto.orden ?? index + 1, // Auto-asignar orden si no viene
        descripcion: dto.descripcion,
        asociado,
      }),
    );

    return manager.save(necesidadEntities);
  }

  async findAll(): Promise<Necesidades[]> {
    return await this.necesidadesRepository.find({
      order: {
        orden: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Necesidades> {
    const necesidad = await this.necesidadesRepository.findOne({
      where: { idNecesidad: id },
    });

    if (!necesidad) {
      throw new NotFoundException(`Necesidad con ID ${id} no encontrada`);
    }

    return necesidad;
  }

  async findByAsociado(idAsociado: number): Promise<Necesidades[]> {
    return await this.necesidadesRepository.find({
      where: { asociado: { idAsociado } },
      order: {
        orden: 'ASC',
      },
    });
  }

  async update(
    id: number,
    updateDto: UpdateNecesidadesDto,
  ): Promise<Necesidades> {
    const necesidad = await this.findOne(id);

    Object.assign(necesidad, updateDto);
    return await this.necesidadesRepository.save(necesidad);
  }

  async remove(id: number): Promise<void> {
    const necesidad = await this.findOne(id);
    await this.necesidadesRepository.remove(necesidad);
  }

  async countByAsociado(idAsociado: number): Promise<number> {
    return await this.necesidadesRepository.count({
      where: { asociado: { idAsociado } },
    });
  }

  async reorderByAsociado(idAsociado: number): Promise<void> {
    const necesidades = await this.findByAsociado(idAsociado);

    for (let i = 0; i < necesidades.length; i++) {
      necesidades[i].orden = i + 1;
      await this.necesidadesRepository.save(necesidades[i]);
    }
  }
}