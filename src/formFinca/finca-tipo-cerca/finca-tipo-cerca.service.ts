import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FincaTipoCerca } from './entities/finca-tipo-cerca.entity';
import { Finca } from '../finca/entities/finca.entity';
import { TipoCerca } from '../tipo-cerca/entities/tipo-cerca.entity';
import { CreateFincaTipoCercaDto } from './dto/create-finca-tipo-cerca';


@Injectable()
export class FincaTipoCercaService {
  constructor(
    @InjectRepository(FincaTipoCerca)
    private readonly repo: Repository<FincaTipoCerca>,
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,
    @InjectRepository(TipoCerca)
    private readonly tipoCercaRepo: Repository<TipoCerca>,
  ) {}

  async link(dto: CreateFincaTipoCercaDto) {
    const finca = await this.fincaRepo.findOne({ where: { idFinca: dto.idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    const tipo = await this.tipoCercaRepo.findOne({ where: { idTipoCerca: dto.idTipoCerca } });
    if (!tipo) throw new NotFoundException('Tipo de cerca no encontrado');

    const exists = await this.repo.findOne({
      where: { idFinca: dto.idFinca, idTipoCerca: dto.idTipoCerca },
    });
    if (exists) throw new BadRequestException('Ya existe el enlace Finca-TipoCerca');

    const entity = this.repo.create({
      idFinca: dto.idFinca,
      idTipoCerca: dto.idTipoCerca,
      finca,
      tipoCerca: tipo,
    });

    return this.repo.save(entity);
  }

  async listByFinca(idFinca: number) {
    const finca = await this.fincaRepo.findOne({ where: { idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    return this.repo.find({
      where: { idFinca },
      relations: ['tipoCerca'],
      order: { id: 'DESC' },
    });
  }

  async unlinkById(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Enlace Finca-TipoCerca no encontrado');
  }

  async unlinkByKeys(idFinca: number, idTipoCerca: number) {
    const res = await this.repo.delete({ idFinca, idTipoCerca });
    if (!res.affected) throw new NotFoundException('Enlace Finca-TipoCerca no encontrado');
  }
}
