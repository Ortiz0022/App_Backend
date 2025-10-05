import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from './entities/equipo.entity';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

@Injectable()
export class EquipoService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
  ) {}

  async create(createDto: CreateEquipoDto): Promise<Equipo> {
    const { nombre } = createDto;

    // Verificar si ya existe un equipo con el mismo nombre
    const existente = await this.equipoRepository.findOne({
      where: { nombre },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un equipo con el nombre "${nombre}"`,
      );
    }

    const equipo = this.equipoRepository.create(createDto);
    return await this.equipoRepository.save(equipo);
  }

  async findAll(): Promise<Equipo[]> {
    return await this.equipoRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Equipo> {
    const equipo = await this.equipoRepository.findOne({
      where: { idEquipo: id },
      relations: ['fincasEquipos', 'fincasEquipos.finca'],
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    return equipo;
  }

  async update(id: number, updateDto: UpdateEquipoDto): Promise<Equipo> {
    const equipo = await this.equipoRepository.findOne({
      where: { idEquipo: id },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    // Si se actualiza el nombre, verificar duplicados
    if (updateDto.nombre) {
      const existente = await this.equipoRepository.findOne({
        where: { nombre: updateDto.nombre },
      });

      if (existente && existente.idEquipo !== id) {
        throw new ConflictException(
          `Ya existe un equipo con el nombre "${updateDto.nombre}"`,
        );
      }
    }

    Object.assign(equipo, updateDto);
    return await this.equipoRepository.save(equipo);
  }

  async remove(id: number): Promise<void> {
    const equipo = await this.equipoRepository.findOne({
      where: { idEquipo: id },
      relations: ['fincasEquipos'],
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    // Verificar si tiene fincas asociadas
    if (equipo.fincasEquipos && equipo.fincasEquipos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el equipo porque tiene fincas asociadas',
      );
    }

    await this.equipoRepository.remove(equipo);
  }

  // Método auxiliar para obtener equipos con conteo de fincas
  async findAllWithFincasCount(): Promise<any[]> {
    const equipos = await this.equipoRepository
      .createQueryBuilder('equipo')
      .leftJoin('equipo.fincasEquipos', 'fincaEquipo')
      .loadRelationCountAndMap('equipo.fincasCount', 'equipo.fincasEquipos')
      .orderBy('equipo.nombre', 'ASC')
      .getMany();

    return equipos;
  }
}