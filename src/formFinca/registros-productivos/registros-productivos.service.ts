import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RegistrosProductivos } from './entities/registros-productivos.entity';
import { CreateRegistrosProductivosDto } from './dto/create-registros-productivos.dto';
import { UpdateRegistrosProductivosDto } from './dto/update-registros-productivos.dto';
import { Finca } from '../finca/entities/finca.entity';


@Injectable()
export class RegistrosProductivosService {
  constructor(
    @InjectRepository(RegistrosProductivos)
    private readonly registrosProductivosRepository: Repository<RegistrosProductivos>,
    @InjectRepository(Finca)
    private readonly fincaRepository: Repository<Finca>,
  ) {}

  async create(
    createDto: CreateRegistrosProductivosDto,
  ): Promise<RegistrosProductivos> {
    const { idFinca, reproductivos, costosProductivos } = createDto;

    const finca = await this.fincaRepository.findOne({
      where: { idFinca },
      relations: ['registrosProductivos'],
    });

    if (!finca) {
      throw new NotFoundException(`Finca con ID ${idFinca} no encontrada`);
    }

    if (finca.registrosProductivos) {
      throw new ConflictException(
        'Esta finca ya tiene registros productivos asociados',
      );
    }

    const registrosProductivos = this.registrosProductivosRepository.create({
      reproductivos,
      costosProductivos,
      finca,
    });

    return await this.registrosProductivosRepository.save(registrosProductivos);
  }

  createInTransaction(
    dto: CreateRegistrosProductivosDto,
    finca: Finca,
    manager: EntityManager,
  ): Promise<RegistrosProductivos> {
    const registros = manager.create(RegistrosProductivos, {
      reproductivos: dto.reproductivos,
      costosProductivos: dto.costosProductivos,
      finca,
    });
  
    return manager.save(registros);
  }

  async findAll(): Promise<RegistrosProductivos[]> {
    return await this.registrosProductivosRepository.find({
      relations: ['finca'],
    });
  }

  async findOne(id: number): Promise<RegistrosProductivos> {
    const registrosProductivos =
      await this.registrosProductivosRepository.findOne({
        where: { idRegistrosProductivos: id },
        relations: ['finca'],
      });

    if (!registrosProductivos) {
      throw new NotFoundException(
        `Registros productivos con ID ${id} no encontrados`,
      );
    }

    return registrosProductivos;
  }

  async findByFinca(idFinca: number): Promise<RegistrosProductivos> {
    const registrosProductivos =
      await this.registrosProductivosRepository.findOne({
        where: { finca: { idFinca } },
        relations: ['finca'],
      });

    if (!registrosProductivos) {
      throw new NotFoundException(
        `Registros productivos para finca con ID ${idFinca} no encontrados`,
      );
    }

    return registrosProductivos;
  }

  async update(
    id: number,
    updateDto: UpdateRegistrosProductivosDto,
  ): Promise<RegistrosProductivos> {
    const registrosProductivos = await this.findOne(id);

    if (updateDto.reproductivos !== undefined) {
      registrosProductivos.reproductivos = updateDto.reproductivos;
    }
    if (updateDto.costosProductivos !== undefined) {
      registrosProductivos.costosProductivos = updateDto.costosProductivos;
    }

    return await this.registrosProductivosRepository.save(registrosProductivos);
  }

  async remove(id: number): Promise<void> {
    const registrosProductivos = await this.findOne(id);
    await this.registrosProductivosRepository.remove(registrosProductivos);
  }

  async getEstadisticas(): Promise<any> {
    const total = await this.registrosProductivosRepository.count();
    const conReproductivos = await this.registrosProductivosRepository.count({
      where: { reproductivos: true },
    });
    const conCostosProductivos = await this.registrosProductivosRepository.count(
      {
        where: { costosProductivos: true },
      },
    );
    const conAmbos = await this.registrosProductivosRepository.count({
      where: { reproductivos: true, costosProductivos: true },
    });
    const sinRegistros = await this.registrosProductivosRepository.count({
      where: { reproductivos: false, costosProductivos: false },
    });

    return {
      total,
      conReproductivos,
      conCostosProductivos,
      conAmbos,
      sinRegistros,
    };
  }
}