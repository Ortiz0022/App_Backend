import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoCerca } from './entities/tipo-cerca.entity';
import { CreateTipoCercaDto } from './dto/create-tipo-cerca.dto';
import { UpdateTipoCercaDto } from './dto/update-tipo-cerca.dto';

@Injectable()
export class TiposCercaService {
  constructor(
    @InjectRepository(TipoCerca)
    private readonly repo: Repository<TipoCerca>,
  ) {}

  create(dto: CreateTipoCercaDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { idTipoCerca: id },
    });
    if (!item) throw new NotFoundException('Tipo de cerca no encontrado');
    return item;
  }

  async update(id: number, dto: UpdateTipoCercaDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) {
      throw new NotFoundException('Tipo de cerca no encontrado');
    }
  }
}
