import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FincaFuenteEnergia } from './entities/finca-fuente-energia.entity';
import { CreateFincaFuenteEnergiaDto } from './dto/create-finca-fuente-energia.dto';
import { UpdateFincaFuenteEnergiaDto } from './dto/update-finca-fuente-energia.dto';
import { Finca } from '../finca/entities/finca.entity';
import { FuenteEnergia } from '../FuenteEnergia/entities/fuente-energia.entity';


@Injectable()
export class FincaFuenteEnergiaService {
  constructor(
    @InjectRepository(FincaFuenteEnergia)
    private readonly fincaFuenteEnergiaRepository: Repository<FincaFuenteEnergia>,
    @InjectRepository(Finca)
    private readonly fincaRepository: Repository<Finca>,
    @InjectRepository(FuenteEnergia)
    private readonly fuenteEnergiaRepository: Repository<FuenteEnergia>,
  ) {}

  async create(
    createDto: CreateFincaFuenteEnergiaDto,
  ): Promise<FincaFuenteEnergia> {
    const { idFinca, idFuenteEnergia } = createDto;

    // Verificar que la finca existe
    const finca = await this.fincaRepository.findOne({
      where: { idFinca },
    });

    if (!finca) {
      throw new NotFoundException(`Finca con ID ${idFinca} no encontrada`);
    }

    // Verificar que la fuente de energía existe
    const fuenteEnergia = await this.fuenteEnergiaRepository.findOne({
      where: { idFuenteEnergia },
    });

    if (!fuenteEnergia) {
      throw new NotFoundException(
        `Fuente de energía con ID ${idFuenteEnergia} no encontrada`,
      );
    }

    // Verificar que no exista ya esta asociación
    const existente = await this.fincaFuenteEnergiaRepository.findOne({
      where: {
        finca: { idFinca },
        fuenteEnergia: { idFuenteEnergia },
      },
    });

    if (existente) {
      throw new ConflictException(
        'Esta finca ya tiene asociada esta fuente de energía',
      );
    }

    const fincaFuenteEnergia = this.fincaFuenteEnergiaRepository.create({
      finca,
      fuenteEnergia,
    });

    return await this.fincaFuenteEnergiaRepository.save(fincaFuenteEnergia);
  }

  async findAll(): Promise<FincaFuenteEnergia[]> {
    return await this.fincaFuenteEnergiaRepository.find({
      relations: ['finca', 'fuenteEnergia'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<FincaFuenteEnergia> {
    const fincaFuenteEnergia =
      await this.fincaFuenteEnergiaRepository.findOne({
        where: { idFincaFuenteEnergia: id },
        relations: ['finca', 'fuenteEnergia'],
      });

    if (!fincaFuenteEnergia) {
      throw new NotFoundException(
        `Asociación finca-fuente de energía con ID ${id} no encontrada`,
      );
    }

    return fincaFuenteEnergia;
  }

  async findByFinca(idFinca: number): Promise<FincaFuenteEnergia[]> {
    return await this.fincaFuenteEnergiaRepository.find({
      where: { finca: { idFinca } },
      relations: ['finca', 'fuenteEnergia'],
      order: {
        fuenteEnergia: { nombre: 'ASC' },
      },
    });
  }

  async findByFuenteEnergia(
    idFuenteEnergia: number,
  ): Promise<FincaFuenteEnergia[]> {
    return await this.fincaFuenteEnergiaRepository.find({
      where: { fuenteEnergia: { idFuenteEnergia } },
      relations: ['finca', 'fuenteEnergia'],
      order: {
        finca: { nombre: 'ASC' },
      },
    });
  }

  async update(
    id: number,
    updateDto: UpdateFincaFuenteEnergiaDto,
  ): Promise<FincaFuenteEnergia> {
    const fincaFuenteEnergia = await this.findOne(id);

    if (updateDto.idFuenteEnergia) {
      // Verificar que la nueva fuente de energía existe
      const fuenteEnergia = await this.fuenteEnergiaRepository.findOne({
        where: { idFuenteEnergia: updateDto.idFuenteEnergia },
      });

      if (!fuenteEnergia) {
        throw new NotFoundException(
          `Fuente de energía con ID ${updateDto.idFuenteEnergia} no encontrada`,
        );
      }

      // Verificar que no exista ya esta asociación
      const existente = await this.fincaFuenteEnergiaRepository.findOne({
        where: {
          finca: { idFinca: fincaFuenteEnergia.finca.idFinca },
          fuenteEnergia: { idFuenteEnergia: updateDto.idFuenteEnergia },
        },
      });

      if (existente && existente.idFincaFuenteEnergia !== id) {
        throw new ConflictException(
          'Esta finca ya tiene asociada esta fuente de energía',
        );
      }

      fincaFuenteEnergia.fuenteEnergia = fuenteEnergia;
    }

    return await this.fincaFuenteEnergiaRepository.save(fincaFuenteEnergia);
  }

  async remove(id: number): Promise<void> {
    const fincaFuenteEnergia = await this.findOne(id);
    await this.fincaFuenteEnergiaRepository.remove(fincaFuenteEnergia);
  }

  // Método para eliminar por finca y fuente de energía
  async removeByFincaAndFuente(
    idFinca: number,
    idFuenteEnergia: number,
  ): Promise<void> {
    const fincaFuenteEnergia =
      await this.fincaFuenteEnergiaRepository.findOne({
        where: {
          finca: { idFinca },
          fuenteEnergia: { idFuenteEnergia },
        },
      });

    if (!fincaFuenteEnergia) {
      throw new NotFoundException(
        'No se encontró la asociación entre la finca y la fuente de energía',
      );
    }

    await this.fincaFuenteEnergiaRepository.remove(fincaFuenteEnergia);
  }
}