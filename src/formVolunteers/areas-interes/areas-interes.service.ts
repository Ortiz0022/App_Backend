import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateAreaInteresDto } from './dto/create-area-interes.dto';
import { UpdateAreaInteresDto } from './dto/update-area-interes.dto';
import { AreaInteres } from './entities/areas-interes.entity';
import { Organizacion } from '../organizacion/entities/organizacion.entity';
import { VoluntarioIndividual } from '../voluntario-individual/entities/voluntario-individual.entity';

@Injectable()
export class AreasInteresService {
  constructor(
    @InjectRepository(AreaInteres)
    private areaInteresRepository: Repository<AreaInteres>,
  ) {}

  // Método transaccional para Organización
  async createForOrganizacionInTransaction(
    createAreaInteresDto: CreateAreaInteresDto,
    organizacion: Organizacion,
    manager: EntityManager,
  ): Promise<AreaInteres> {
    const areaInteres = manager.create(AreaInteres, {
      ...createAreaInteresDto,
      organizacion,
      voluntario: undefined,
    });

    return manager.save(areaInteres);
  }

  // Método transaccional para Voluntario
  async createForVoluntarioInTransaction(
    createAreaInteresDto: CreateAreaInteresDto,
    voluntario: VoluntarioIndividual,
    manager: EntityManager,
  ): Promise<AreaInteres> {
    const areaInteres = manager.create(AreaInteres, {
      ...createAreaInteresDto,
      organizacion: undefined,
      voluntario,
    });

    return manager.save(areaInteres);
  }

  async findAll(): Promise<AreaInteres[]> {
    return this.areaInteresRepository.find({
      relations: ['organizacion', 'voluntario'],
    });
  }

  async findOne(id: number): Promise<AreaInteres> {
    const areaInteres = await this.areaInteresRepository.findOne({
      where: { idAreaInteres: id },
      relations: ['organizacion', 'voluntario'],
    });

    if (!areaInteres) {
      throw new NotFoundException(`Área de interés con ID ${id} no encontrada`);
    }

    return areaInteres;
  }

  async update(
    id: number,
    updateAreaInteresDto: UpdateAreaInteresDto,
  ): Promise<AreaInteres> {
    const areaInteres = await this.findOne(id);
    Object.assign(areaInteres, updateAreaInteresDto);
    return this.areaInteresRepository.save(areaInteres);
  }

  async remove(id: number): Promise<void> {
    const areaInteres = await this.findOne(id);
    await this.areaInteresRepository.remove(areaInteres);
  }
}