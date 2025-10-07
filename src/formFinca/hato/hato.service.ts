import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Hato } from './entities/hato.entity';
import { CreateHatoDto } from './dto/create-hato.dto';
import { UpdateHatoDto } from './dto/update-hato.dto';
import { Finca } from '../finca/entities/finca.entity';
import { Animal } from '../animal/entities/animal.entity';

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
  
    const finca = await this.fincaRepository.findOne({
      where: { idFinca },
      relations: ['hato'],
    });
  
    if (!finca) {
      throw new NotFoundException(`Finca con ID ${idFinca} no encontrada`);
    }
  
    if (finca.hato) {
      throw new ConflictException('Esta finca ya tiene un hato registrado');
    }
  
    const hato = this.hatoRepository.create({
      tipoExplotacion,
      totalGanado: totalGanado || 0,  // ✅ Default 0 si no viene
      razaPredominante,
      finca,
    });
  
    return await this.hatoRepository.save(hato);
  }

  createInTransaction(
    dto: CreateHatoDto,
    finca: Finca,
    manager: EntityManager,
  ): Promise<Hato> {
    const hato = manager.create(Hato, {
      tipoExplotacion: dto.tipoExplotacion,
      totalGanado: dto.totalGanado || 0,
      razaPredominante: dto.razaPredominante,
      finca,
    });
  
    return manager.save(hato);
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

  async updateTotalInTransaction(
    hato: Hato,
    manager: EntityManager,
  ): Promise<Hato> {
    const animales = await manager.find(Animal, {
      where: { hato: { idHato: hato.idHato } },
    });
  
    const total = animales.reduce((sum, animal) => sum + animal.cantidad, 0);
    hato.totalGanado = total;
  
    return manager.save(hato);
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

  async recalcularTotal(idHato: number): Promise<Hato> {
    const hato = await this.hatoRepository.findOne({
      where: { idHato },
      relations: ['animales'],
    });
  
    if (!hato) {
      throw new NotFoundException(`Hato con ID ${idHato} no encontrado`);
    }
  
    const total = hato.animales.reduce((sum, animal) => sum + animal.cantidad, 0);
    
    hato.totalGanado = total;
    return await this.hatoRepository.save(hato);
  }
}