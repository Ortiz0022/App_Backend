import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MetodoRiego } from './entities/metodo-riego.entity';
import { CreateMetodoRiegoDto } from './dto/create-metodo-riego.dto';
import { UpdateMetodoRiegoDto } from './dto/update-metodo-riego.dto';
import { Finca } from '../finca/entities/finca.entity';


@Injectable()
export class MetodoRiegoService {
  constructor(
    @InjectRepository(MetodoRiego)
    private readonly metodoRiegoRepository: Repository<MetodoRiego>,
    @InjectRepository(Finca)
    private readonly fincaRepository: Repository<Finca>,
  ) {}

  async create(createDto: CreateMetodoRiegoDto): Promise<MetodoRiego> {
    const { idFinca, nombre } = createDto;

    const finca = await this.fincaRepository.findOne({
      where: { idFinca },
    });

    if (!finca) {
      throw new NotFoundException(`Finca con ID ${idFinca} no encontrada`);
    }

    // Verificar que la finca no tenga ya este método de riego
    const existente = await this.metodoRiegoRepository.findOne({
      where: {
        finca: { idFinca },
        nombre,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Esta finca ya tiene registrado el método de riego "${nombre}"`,
      );
    }

    const metodoRiego = this.metodoRiegoRepository.create({
      nombre,
      finca,
    });

    return await this.metodoRiegoRepository.save(metodoRiego);
  }

  async createManyInTransaction(
    metodos: CreateMetodoRiegoDto[],
    finca: Finca,
    manager: EntityManager,
  ): Promise<MetodoRiego[]> {
    const metodoEntities = metodos.map((dto) =>
      manager.create(MetodoRiego, {
        nombre: dto.nombre,
        finca,
      }),
    );
  
    return manager.save(metodoEntities);
  }

  async findAll(): Promise<MetodoRiego[]> {
    return await this.metodoRiegoRepository.find({
      relations: ['finca'],
    });
  }

  async findOne(id: number): Promise<MetodoRiego> {
    const metodoRiego = await this.metodoRiegoRepository.findOne({
      where: { idMetodoRiego: id },
      relations: ['finca'],
    });

    if (!metodoRiego) {
      throw new NotFoundException(
        `Método de riego con ID ${id} no encontrado`,
      );
    }

    return metodoRiego;
  }

  async findByFinca(idFinca: number): Promise<MetodoRiego[]> {
    return await this.metodoRiegoRepository.find({
      where: { finca: { idFinca } },
      relations: ['finca'],
      order: {
        nombre: 'ASC',
      },
    });
  }

  async update(
    id: number,
    updateDto: UpdateMetodoRiegoDto,
  ): Promise<MetodoRiego> {
    const metodoRiego = await this.findOne(id);

    // Si se actualiza el nombre, verificar duplicados en la misma finca
    if (updateDto.nombre) {
      const existente = await this.metodoRiegoRepository.findOne({
        where: {
          finca: { idFinca: metodoRiego.finca.idFinca },
          nombre: updateDto.nombre,
        },
      });

      if (existente && existente.idMetodoRiego !== id) {
        throw new ConflictException(
          `Esta finca ya tiene registrado el método de riego "${updateDto.nombre}"`,
        );
      }
    }

    Object.assign(metodoRiego, updateDto);
    return await this.metodoRiegoRepository.save(metodoRiego);
  }

  async remove(id: number): Promise<void> {
    const metodoRiego = await this.findOne(id);
    await this.metodoRiegoRepository.remove(metodoRiego);
  }

  async countByFinca(idFinca: number): Promise<number> {
    return await this.metodoRiegoRepository.count({
      where: { finca: { idFinca } },
    });
  }
}