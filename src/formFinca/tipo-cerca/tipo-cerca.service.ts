import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { TipoCerca } from './entities/tipo-cerca.entity';
import { CreateTipoCercaDto } from './dto/create-tipo-cerca.dto';
import { UpdateTipoCercaDto } from './dto/update-tipo-cerca.dto';

function atLeastOneTrue(alambrePuas?: boolean, viva?: boolean, electrica?: boolean, pMuerto?: boolean) {
  return !!(alambrePuas || viva || electrica || pMuerto);
}

@Injectable()
export class TiposCercaService {
  constructor(
    @InjectRepository(TipoCerca)
    private readonly repo: Repository<TipoCerca>,
  ) {}

  async create(dto: CreateTipoCercaDto) {
    if (!atLeastOneTrue(dto.alambrePuas, dto.viva, dto.electrica, dto.pMuerto)) {
      throw new BadRequestException('Debe activar al menos una opción (alambre de puas, viva, eléctrica o p. muerto).');
    }

    const dup = await this.repo.findOne({
      where: { alambrePuas: dto.alambrePuas, viva: dto.viva, electrica: dto.electrica, pMuerto: dto.pMuerto },
    });
    if (dup) throw new BadRequestException('Ya existe un TipoCerca con esa combinación.');

    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findOrCreateInTransaction(
    dto: CreateTipoCercaDto,
    manager: EntityManager,
  ): Promise<TipoCerca> {
    if (!atLeastOneTrue(dto.alambrePuas, dto.viva, dto.electrica, dto.pMuerto)) {
      throw new BadRequestException('Debe activar al menos una opción (alambre de puas, viva, eléctrica o p. muerto).');
    }
  
    // Buscar combinación existente
    let tipoCerca = await manager.findOne(TipoCerca, {
      where: {
        alambrePuas: dto.alambrePuas,
        viva: dto.viva,
        electrica: dto.electrica,
        pMuerto: dto.pMuerto,
      },
    });
  
    if (!tipoCerca) {
      // Crear nueva combinación
      tipoCerca = manager.create(TipoCerca, dto);
      await manager.save(tipoCerca);
    }
  
    return tipoCerca;
  }

  findAll() {
    return this.repo.find({ order: { idTipoCerca: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { idTipoCerca: id } });
    if (!item) throw new NotFoundException('Tipo de cerca no encontrado');
    return item;
  }

  async update(id: number, dto: UpdateTipoCercaDto) {
    const entity = await this.findOne(id);
    const next = { ...entity, ...dto };

    if (!atLeastOneTrue(next.alambrePuas, next.viva, next.electrica, next.pMuerto)) {
      throw new BadRequestException('Debe quedar al menos una opción en true.');
    }

    const dup = await this.repo.findOne({
      where: {
        alambrePuas: next.alambrePuas,
        viva: next.viva,
        electrica: next.electrica,
        pMuerto: next.pMuerto,
        idTipoCerca: Not(id), // excluye el propio registro
      },
    });
    if (dup) throw new BadRequestException('Esa combinación ya existe en otro registro.');

    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Tipo de cerca no encontrado');
  }
}
