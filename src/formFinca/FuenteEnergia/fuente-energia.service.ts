import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuenteEnergia } from './entities/fuente-energia.entity';
import { CreateFuenteEnergiaDto } from './dto/create-fuente-energia.dto';
import { UpdateFuenteEnergiaDto } from './dto/update-fuente-energia.dto';

@Injectable()
export class FuenteEnergiaService {
  constructor(
    @InjectRepository(FuenteEnergia)
    private readonly fuenteEnergiaRepository: Repository<FuenteEnergia>,
  ) {}

  async create(createDto: CreateFuenteEnergiaDto): Promise<FuenteEnergia> {
    const { nombre } = createDto;

    // Verificar si ya existe una fuente de energía con el mismo nombre
    const existente = await this.fuenteEnergiaRepository.findOne({
      where: { nombre },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una fuente de energía con el nombre "${nombre}"`,
      );
    }

    const fuenteEnergia = this.fuenteEnergiaRepository.create(createDto);
    return await this.fuenteEnergiaRepository.save(fuenteEnergia);
  }

  async findAll(): Promise<FuenteEnergia[]> {
    return await this.fuenteEnergiaRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<FuenteEnergia> {
    const fuenteEnergia = await this.fuenteEnergiaRepository.findOne({
      where: { idFuenteEnergia: id },
      relations: ['fincasFuentesEnergia', 'fincasFuentesEnergia.finca'],
    });

    if (!fuenteEnergia) {
      throw new NotFoundException(
        `Fuente de energía con ID ${id} no encontrada`,
      );
    }

    return fuenteEnergia;
  }

  async update(
    id: number,
    updateDto: UpdateFuenteEnergiaDto,
  ): Promise<FuenteEnergia> {
    const fuenteEnergia = await this.fuenteEnergiaRepository.findOne({
      where: { idFuenteEnergia: id },
    });

    if (!fuenteEnergia) {
      throw new NotFoundException(
        `Fuente de energía con ID ${id} no encontrada`,
      );
    }

    // Si se actualiza el nombre, verificar duplicados
    if (updateDto.nombre) {
      const existente = await this.fuenteEnergiaRepository.findOne({
        where: { nombre: updateDto.nombre },
      });

      if (existente && existente.idFuenteEnergia !== id) {
        throw new ConflictException(
          `Ya existe una fuente de energía con el nombre "${updateDto.nombre}"`,
        );
      }
    }

    Object.assign(fuenteEnergia, updateDto);
    return await this.fuenteEnergiaRepository.save(fuenteEnergia);
  }

  async remove(id: number): Promise<void> {
    const fuenteEnergia = await this.fuenteEnergiaRepository.findOne({
      where: { idFuenteEnergia: id },
      relations: ['fincasFuentesEnergia'],
    });

    if (!fuenteEnergia) {
      throw new NotFoundException(
        `Fuente de energía con ID ${id} no encontrada`,
      );
    }

    // Verificar si tiene fincas asociadas
    if (
      fuenteEnergia.fincasFuentesEnergia &&
      fuenteEnergia.fincasFuentesEnergia.length > 0
    ) {
      throw new BadRequestException(
        'No se puede eliminar la fuente de energía porque tiene fincas asociadas',
      );
    }

    await this.fuenteEnergiaRepository.remove(fuenteEnergia);
  }

  // Método auxiliar para obtener fuentes con conteo de fincas
  async findAllWithFincasCount(): Promise<any[]> {
    const fuentes = await this.fuenteEnergiaRepository
      .createQueryBuilder('fuenteEnergia')
      .leftJoin('fuenteEnergia.fincasFuentesEnergia', 'fincaFuenteEnergia')
      .loadRelationCountAndMap(
        'fuenteEnergia.fincasCount',
        'fuenteEnergia.fincasFuentesEnergia',
      )
      .orderBy('fuenteEnergia.nombre', 'ASC')
      .getMany();

    return fuentes;
  }
}