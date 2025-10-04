import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FincaInfraestructura } from './entities/fincaInfraestructura.entity';
import { Finca } from '../finca/entities/finca.entity';
import { Infraestructura } from '../infraestructura/entities/infraestructura.entity';
import { CreateFincaInfraestructuraDto } from './dto/create-fincaInfraestructura.dto';


@Injectable()
export class FincaInfraestructurasService {
  constructor(
    @InjectRepository(FincaInfraestructura)
    private readonly repo: Repository<FincaInfraestructura>,
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,
    @InjectRepository(Infraestructura)
    private readonly infraRepo: Repository<Infraestructura>,
  ) {}

  async link(dto: CreateFincaInfraestructuraDto) {
    // Validaciones simples de existencia
    const finca = await this.fincaRepo.findOne({ where: { idFinca: dto.idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    const infra = await this.infraRepo.findOne({
      where: { idInfraestructura: dto.idInfraestructura },
    });
    if (!infra) throw new NotFoundException('Infraestructura no encontrada');

    // Evitar duplicados (además del @Unique)
    const exists = await this.repo.findOne({
      where: { idFinca: dto.idFinca, idInfraestructura: dto.idInfraestructura },
    });
    if (exists) throw new BadRequestException('Ya existe el enlace Finca-Infraestructura');

    const entity = this.repo.create({
      idFinca: dto.idFinca,
      idInfraestructura: dto.idInfraestructura,
      finca,
      infraestructura: infra,
    });

    return this.repo.save(entity);
  }

  // Lista las infraestructuras de una finca (incluye el objeto Infraestructura)
  async listByFinca(idFinca: number) {
    const finca = await this.fincaRepo.findOne({ where: { idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    return this.repo.find({
      where: { idFinca },
      relations: ['infraestructura'],
      order: { id: 'DESC' },
    });
  }

  // Eliminar el enlace por ID
  async unlinkById(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Enlace Finca-Infraestructura no encontrado');
  }

  // (Opcional) Eliminar por llaves compuestas
  async unlinkByKeys(idFinca: number, idInfraestructura: number) {
    const res = await this.repo.delete({ idFinca, idInfraestructura });
    if (!res.affected) throw new NotFoundException('Enlace Finca-Infraestructura no encontrado');
  }
}
