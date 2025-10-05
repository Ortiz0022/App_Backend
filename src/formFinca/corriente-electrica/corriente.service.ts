import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CreateCorrienteDto } from './dto/create-corriente.dto';
import { UpdateCorrienteDto } from './dto/update-corriente.dto';
import { CorrienteElectrica } from './entities/corriente.entity';

function alMenosUnaTrue(pub?: boolean, priv?: boolean) {
  return !!(pub || priv);
}

@Injectable()
export class CorrienteElectricaService {
  constructor(
    @InjectRepository(CorrienteElectrica)
    private readonly repo: Repository<CorrienteElectrica>,
  ) {}

  async create(dto: CreateCorrienteDto) {
    if (!alMenosUnaTrue(dto.publica, dto.privada)) {
      throw new BadRequestException('Debe activar al menos una opción: pública o privada.');
    }

    // evitar duplicados por combinación
    const dup = await this.repo.findOne({
      where: { publica: dto.publica, privada: dto.privada },
    });
    if (dup) throw new BadRequestException('Ya existe un registro con esa combinación.');

    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { idCorrienteElectrica: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { idCorrienteElectrica: id } });
    if (!item) throw new NotFoundException('Corriente eléctrica no encontrada');
    return item;
  }

  async update(id: number, dto: UpdateCorrienteDto) {
    const entity = await this.findOne(id);
    const next = { ...entity, ...dto };

    if (!alMenosUnaTrue(next.publica, next.privada)) {
      throw new BadRequestException('Debe quedar al menos una opción en true (pública o privada).');
    }

    const dup = await this.repo.findOne({
      where: {
        publica: next.publica,
        privada: next.privada,
        idCorrienteElectrica: Not(id), // no comparar consigo mismo
      },
    });
    if (dup) throw new BadRequestException('Esa combinación ya existe en otro registro.');

    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Corriente eléctrica no encontrada');
  }
}
