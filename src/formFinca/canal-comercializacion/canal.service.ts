import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CanalComercializacion } from './entities/canal.entity';
import { Finca } from '../finca/entities/finca.entity';
import { CreateCanalDto } from './dto/create-canal';
import { UpdateCanalDto } from './dto/update-canal';


@Injectable()
export class CanalesComercializacionService {
  constructor(
    @InjectRepository(CanalComercializacion)
    private readonly repo: Repository<CanalComercializacion>,
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,
  ) {}

  async create(dto: CreateCanalDto) {
    // validar que la finca exista
    const finca = await this.fincaRepo.findOne({ where: { idFinca: dto.idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    const entity = this.repo.create({ ...dto, finca });
    return this.repo.save(entity);
  }

  // listado general con filtros opcionales
  async findAll(params?: { idFinca?: number; search?: string }) {
    const where: any = {};
    if (params?.idFinca) where.idFinca = params.idFinca;

    if (params?.search) {
      const needle = ILike(`%${params.search}%`);
      return this.repo.find({
        where: [{ ...where, nombre: needle }],
        order: { idCanal: 'DESC' },
      });
    }

    return this.repo.find({ where, order: { idCanal: 'DESC' } });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { idCanal: id } });
    if (!item) throw new NotFoundException('Canal no encontrado');
    return item;
  }

  async listByFinca(idFinca: number) {
    // asegura que la finca existe (opcional, pero útil)
    const finca = await this.fincaRepo.findOne({ where: { idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    return this.repo.find({
      where: { idFinca },
      order: { idCanal: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateCanalDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Canal no encontrado');
  }
}
