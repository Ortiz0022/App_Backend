import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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
    // Primero verificar si la finca existe
    const finca = await this.fincaRepo.findOne({ where: { idFinca } });
    if (!finca) {
      throw new NotFoundException('Finca no encontrada');
    }

    // Buscar los enlaces con manejo de errores
    try {
      const enlaces = await this.repo.find({
        where: { idFinca },
        relations: ['tipoCerca'],
        order: { id: 'DESC' },
      });

      return enlaces;
    } catch (error) {
      console.error('Error al buscar tipos de cerca:', error);
      throw new BadRequestException('Error al cargar los tipos de cerca de la finca');
    }
  }

  async unlinkById(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Enlace Finca-TipoCerca no encontrado');
  }

  async unlinkByKeys(idFinca: number, idTipoCerca: number) {
    const res = await this.repo.delete({ idFinca, idTipoCerca });
    if (!res.affected) throw new NotFoundException('Enlace Finca-TipoCerca no encontrado');
  }

  async linkInTransaction(
    dto: CreateFincaTipoCercaDto,
    finca: Finca,
    tipoCerca: TipoCerca,
    manager: EntityManager,
  ): Promise<FincaTipoCerca> {
    try {
      // Verificar si ya existe el enlace
      const existing = await manager.findOne(FincaTipoCerca, {
        where: { 
          idFinca: finca.idFinca, 
          idTipoCerca: tipoCerca.idTipoCerca 
        },
      });

      if (existing) {
        // Si ya existe, retornarlo en lugar de crear uno nuevo
        return existing;
      }

      const entity = manager.create(FincaTipoCerca, {
        idFinca: finca.idFinca,
        idTipoCerca: tipoCerca.idTipoCerca,
        finca,
        tipoCerca,
      });
    
      return await manager.save(entity);
    } catch (error) {
      console.error('Error en linkInTransaction:', error);
      throw new BadRequestException('Error al vincular tipo de cerca con la finca');
    }
  }
}