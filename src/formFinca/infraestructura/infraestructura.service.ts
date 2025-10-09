import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Infraestructura } from './entities/infraestructura.entity';
import { CreateInfraestructuraDto } from './dto/create-infraestructura.dto';
import { UpdateInfraestructuraDto } from './dto/update-infraestructura.dto';

@Injectable()
export class InfraestructurasService {
  constructor(
    @InjectRepository(Infraestructura)
    private readonly repo: Repository<Infraestructura>,
  ) {}

  create(dto: CreateInfraestructuraDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findOrCreateInTransaction(
    nombre: string,
    descripcion: string | undefined,
    manager: EntityManager,
  ): Promise<Infraestructura> {
    let infraestructura = await manager.findOne(Infraestructura, {
      where: { nombre },
    });
  
    if (!infraestructura) {
      infraestructura = manager.create(Infraestructura, {
        nombre,
        descripcion,
      });
      await manager.save(infraestructura);
    }
  
    return infraestructura;
  }

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const infra = await this.repo.findOne({
      where: { idInfraestructura: id },
    });
    if (!infra) throw new NotFoundException('Infraestructura no encontrada');
    return infra;
  }

  async update(id: number, dto: UpdateInfraestructuraDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Infraestructura no encontrada');
  }
}
