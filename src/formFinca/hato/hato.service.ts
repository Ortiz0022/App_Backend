import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hato } from './entities/hato.entity';
import { CreateHatoDto } from './dto/create-hato.dto';
import { UpdateHatoDto } from './dto/update-hato.dto';
import { Finca } from '../finca/entities/finca.entity';

@Injectable()
export class HatoService {
  constructor(
    @InjectRepository(Hato)
    private readonly hatoRepository: Repository<Hato>,
    @InjectRepository(Finca)
    private readonly fincaRepository: Repository<Finca>,
  ) {}

  async create(createDto: CreateHatoDto): Promise<Hato> {
    const { idFinca, tipoExplotacion, totalGanado, razaPredominante } = createDto;

    // Verificar que la finca existe
    const finca = await this.fincaRepository.findOne({
      where: { idFinca },
      relations: ['hato'],
    });

    if (!finca) {
      throw new NotFoundException(`Finca con ID ${idFinca} no encontrada`);
    }

    // Verificar que la finca no tenga ya un hato
    if (finca.hato) {
      throw new ConflictException('Esta finca ya tiene un hato registrado');
    }

    const hato = this.hatoRepository.create({
      tipoExplotacion,
      totalGanado,
      razaPredominante,
      finca,
    });

    return await this.hatoRepository.save(hato);
  }

  async findAll(): Promise<Hato[]> {
    return await this.hatoRepository.find({
      relations: ['finca', 'animales'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Hato> {
    const hato = await this.hatoRepository.findOne({
      where: { idHato: id },
      relations: ['finca', 'animales'],
    });

    if (!hato) {
      throw new NotFoundException(`Hato con ID ${id} no encontrado`);
    }

    return hato;
  }

  async findByFinca(idFinca: number): Promise<Hato> {
    const hato = await this.hatoRepository.findOne({
      where: { finca: { idFinca } },
      relations: ['finca', 'animales'],
    });

    if (!hato) {
      throw new NotFoundException(
        `Hato para finca con ID ${idFinca} no encontrado`,
      );
    }

    return hato;
  }

  async update(id: number, updateDto: UpdateHatoDto): Promise<Hato> {
    const hato = await this.findOne(id);

    Object.assign(hato, updateDto);
    return await this.hatoRepository.save(hato);
  }

  async remove(id: number): Promise<void> {
    const hato = await this.hatoRepository.findOne({
      where: { idHato: id },
      relations: ['animales'],
    });

    if (!hato) {
      throw new NotFoundException(`Hato con ID ${id} no encontrado`);
    }

    await this.hatoRepository.remove(hato);
  }

  // Método auxiliar para obtener hatos con conteo de animales
  async findAllWithAnimalesCount(): Promise<any[]> {
    const hatos = await this.hatoRepository
      .createQueryBuilder('hato')
      .leftJoinAndSelect('hato.finca', 'finca')
      .leftJoin('hato.animales', 'animal')
      .loadRelationCountAndMap('hato.animalesCount', 'hato.animales')
      .orderBy('hato.createdAt', 'DESC')
      .getMany();

    return hatos;
  }
}