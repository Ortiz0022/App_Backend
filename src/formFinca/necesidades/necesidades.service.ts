import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    // Verificar que el asociado existe
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

  async findAll(): Promise<Necesidades[]> {
    return await this.necesidadesRepository.find({
      relations: ['asociado', 'asociado.persona'],
      order: {
        orden: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Necesidades> {
    const necesidad = await this.necesidadesRepository.findOne({
      where: { idNecesidad: id },
      relations: ['asociado', 'asociado.persona'],
    });

    if (!necesidad) {
      throw new NotFoundException(`Necesidad con ID ${id} no encontrada`);
    }

    return necesidad;
  }

  async findByAsociado(idAsociado: number): Promise<Necesidades[]> {
    return await this.necesidadesRepository.find({
      where: { asociado: { idAsociado } },
      relations: ['asociado', 'asociado.persona'],
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

  // Método auxiliar para contar necesidades por asociado
  async countByAsociado(idAsociado: number): Promise<number> {
    return await this.necesidadesRepository.count({
      where: { asociado: { idAsociado } },
    });
  }

  // Método para reordenar necesidades de un asociado
  async reorderByAsociado(idAsociado: number): Promise<void> {
    const necesidades = await this.findByAsociado(idAsociado);

    for (let i = 0; i < necesidades.length; i++) {
      necesidades[i].orden = i + 1;
      await this.necesidadesRepository.save(necesidades[i]);
    }
  }
}