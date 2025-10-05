import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { FuenteAgua } from './entities/fuente-agua.entity';
import { Finca } from '../finca/entities/finca.entity';
import { CreateFuenteAguaDto } from './dto/create-fuente-agua';
import { UpdateFuenteAguaDto } from './dto/update-fuente-agua';


@Injectable()
export class FuentesAguaService {
  constructor(
    @InjectRepository(FuenteAgua)
    private readonly repo: Repository<FuenteAgua>,
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,
  ) {}

  async create(dto: CreateFuenteAguaDto) {
    const finca = await this.fincaRepo.findOne({ where: { idFinca: dto.idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    // evitar duplicados por finca + nombre (además del @Unique)
    const exists = await this.repo.findOne({
      where: { idFinca: dto.idFinca, nombre: dto.nombre },
    });
    if (exists) throw new BadRequestException('Ya existe una fuente con ese nombre en esta finca');

    const entity = this.repo.create({ ...dto, finca });
    return this.repo.save(entity);
  }

  // Lista general con filtros: idFinca y search por nombre
  async findAll(params?: { idFinca?: number; search?: string }) {
    const where: any = {};
    if (params?.idFinca) where.idFinca = params.idFinca;

    if (params?.search) {
      const needle = ILike(`%${params.search}%`);
      return this.repo.find({
        where: [{ ...where, nombre: needle }],
        order: { idFuenteAgua: 'DESC' },
      });
    }

    return this.repo.find({ where, order: { idFuenteAgua: 'DESC' } });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { idFuenteAgua: id } });
    if (!item) throw new NotFoundException('Fuente de agua no encontrada');
    return item;
  }

  async listByFinca(idFinca: number) {
    const finca = await this.fincaRepo.findOne({ where: { idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    return this.repo.find({
      where: { idFinca },
      order: { idFuenteAgua: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateFuenteAguaDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Fuente de agua no encontrada');
  }
}
