import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FincaEquipo } from './entities/finca-equipo.entity';
import { CreateFincaEquipoDto } from './dto/create-finca-equipo.dto';
import { UpdateFincaEquipoDto } from './dto/update-finca-equipo.dto';
import { Equipo } from 'src/formFinca/equipo/entities/equipo.entity';
import { Finca } from '../finca/entities/finca.entity';

@Injectable()
export class FincaEquipoService {
  constructor(
    @InjectRepository(FincaEquipo)
    private readonly fincaEquipoRepository: Repository<FincaEquipo>,
    @InjectRepository(Finca)
    private readonly fincaRepository: Repository<Finca>,
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
  ) {}

  async create(createDto: CreateFincaEquipoDto): Promise<FincaEquipo> {
    const { idFinca, idEquipo } = createDto;

    // Verificar que la finca existe
    const finca = await this.fincaRepository.findOne({
      where: { idFinca },
    });

    if (!finca) {
      throw new NotFoundException(`Finca con ID ${idFinca} no encontrada`);
    }

    // Verificar que el equipo existe
    const equipo = await this.equipoRepository.findOne({
      where: { idEquipo },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${idEquipo} no encontrado`);
    }

    // Verificar que no exista ya esta asociación
    const existente = await this.fincaEquipoRepository.findOne({
      where: {
        finca: { idFinca },
        equipo: { idEquipo },
      },
    });

    if (existente) {
      throw new ConflictException(
        'Esta finca ya tiene asociado este equipo',
      );
    }

    const fincaEquipo = this.fincaEquipoRepository.create({
      finca,
      equipo,
    });

    return await this.fincaEquipoRepository.save(fincaEquipo);
  }

  async findAll(): Promise<FincaEquipo[]> {
    return await this.fincaEquipoRepository.find({
      relations: ['finca', 'equipo'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<FincaEquipo> {
    const fincaEquipo = await this.fincaEquipoRepository.findOne({
      where: { idFincaEquipo: id },
      relations: ['finca', 'equipo'],
    });

    if (!fincaEquipo) {
      throw new NotFoundException(
        `Asociación finca-equipo con ID ${id} no encontrada`,
      );
    }

    return fincaEquipo;
  }

  async findByFinca(idFinca: number): Promise<FincaEquipo[]> {
    return await this.fincaEquipoRepository.find({
      where: { finca: { idFinca } },
      relations: ['finca', 'equipo'],
      order: {
        equipo: { nombre: 'ASC' },
      },
    });
  }

  async findByEquipo(idEquipo: number): Promise<FincaEquipo[]> {
    return await this.fincaEquipoRepository.find({
      where: { equipo: { idEquipo } },
      relations: ['finca', 'equipo'],
      order: {
        finca: { nombre: 'ASC' },
      },
    });
  }

  async update(
    id: number,
    updateDto: UpdateFincaEquipoDto,
  ): Promise<FincaEquipo> {
    const fincaEquipo = await this.findOne(id);

    if (updateDto.idEquipo) {
      // Verificar que el nuevo equipo existe
      const equipo = await this.equipoRepository.findOne({
        where: { idEquipo: updateDto.idEquipo },
      });

      if (!equipo) {
        throw new NotFoundException(
          `Equipo con ID ${updateDto.idEquipo} no encontrado`,
        );
      }

      // Verificar que no exista ya esta asociación
      const existente = await this.fincaEquipoRepository.findOne({
        where: {
          finca: { idFinca: fincaEquipo.finca.idFinca },
          equipo: { idEquipo: updateDto.idEquipo },
        },
      });

      if (existente && existente.idFincaEquipo !== id) {
        throw new ConflictException(
          'Esta finca ya tiene asociado este equipo',
        );
      }

      fincaEquipo.equipo = equipo;
    }

    return await this.fincaEquipoRepository.save(fincaEquipo);
  }

  async remove(id: number): Promise<void> {
    const fincaEquipo = await this.findOne(id);
    await this.fincaEquipoRepository.remove(fincaEquipo);
  }

  // Método para eliminar por finca y equipo
  async removeByFincaAndEquipo(
    idFinca: number,
    idEquipo: number,
  ): Promise<void> {
    const fincaEquipo = await this.fincaEquipoRepository.findOne({
      where: {
        finca: { idFinca },
        equipo: { idEquipo },
      },
    });

    if (!fincaEquipo) {
      throw new NotFoundException(
        'No se encontró la asociación entre la finca y el equipo',
      );
    }

    await this.fincaEquipoRepository.remove(fincaEquipo);
  }
}