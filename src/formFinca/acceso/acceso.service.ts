import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Acceso } from './entities/acceso.entity';
import { CreateAccesoDto } from './dto/create-acceso.dto';
import { UpdateAccesoDto } from './dto/update-acceso.dto';
import { Finca } from '../finca/entities/finca.entity';


@Injectable()
export class AccesoService {
  constructor(
    @InjectRepository(Acceso)
    private readonly accesoRepository: Repository<Acceso>,
    @InjectRepository(Finca)
    private readonly fincaRepository: Repository<Finca>,
  ) {}

  async create(createDto: CreateAccesoDto): Promise<Acceso> {
    const { idFinca, nombre } = createDto;

    const finca = await this.fincaRepository.findOne({
      where: { idFinca },
    });

    if (!finca) {
      throw new NotFoundException(`Finca con ID ${idFinca} no encontrada`);
    }

    const acceso = this.accesoRepository.create({
      nombre,
      finca,
    });

    return await this.accesoRepository.save(acceso);
  }

  async findAll(): Promise<Acceso[]> {
    return await this.accesoRepository.find({
      relations: ['finca'],
    });
  }

  async findOne(id: number): Promise<Acceso> {
    const acceso = await this.accesoRepository.findOne({
      where: { idAcceso: id },
      relations: ['finca'],
    });

    if (!acceso) {
      throw new NotFoundException(`Acceso con ID ${id} no encontrado`);
    }

    return acceso;
  }

  async findByFinca(idFinca: number): Promise<Acceso[]> {
    return await this.accesoRepository.find({
      where: { finca: { idFinca } },
      relations: ['finca'],
      order: {
        nombre: 'ASC',
      },
    });
  }

  async update(id: number, updateDto: UpdateAccesoDto): Promise<Acceso> {
    const acceso = await this.findOne(id);

    Object.assign(acceso, updateDto);
    return await this.accesoRepository.save(acceso);
  }

  async remove(id: number): Promise<void> {
    const acceso = await this.findOne(id);
    await this.accesoRepository.remove(acceso);
  }

  async countByFinca(idFinca: number): Promise<number> {
    return await this.accesoRepository.count({
      where: { finca: { idFinca } },
    });
  }
}