import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Finca } from './entities/finca.entity';
import { CreateFincaDto } from './dto/create-finca.dto';
import { UpdateFincaDto } from './dto/update-finca.dto';
import { QueryFincaDto } from './dto/query-finca.dto';
import { AssociatesService } from '../associates/associates.service';

@Injectable()
export class FincaService {
  constructor(
    @InjectRepository(Finca)
    private readonly repo: Repository<Finca>,
    private readonly associatesService: AssociatesService, // Para validar que existe el asociado
  ) {}

  async create(dto: CreateFincaDto): Promise<Finca> {
    // Validar que el asociado exista
    await this.associatesService.findOne(dto.idAsociado);

    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(query: QueryFincaDto): Promise<Finca[]> {
    const where: any = {};
    if (query.idAsociado) {
      where.idAsociado = query.idAsociado;
    }

    if (query.search) {
      const needle = ILike(`%${query.search}%`);
      return this.repo.find({
        where: [
          { ...where, nombre: needle },
          { ...where, numeroPlano: needle },
        ],
        relations: ['asociado'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.repo.find({
      where,
      relations: ['asociado'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Finca> {
    const finca = await this.repo.findOne({
      where: { idFinca: id },
      relations: ['asociado'],
    });
    if (!finca) throw new NotFoundException('Finca not found');
    return finca;
  }

  async findByAssociate(idAsociado: number): Promise<Finca[]> {
    await this.associatesService.findOne(idAsociado); // Validar que existe
    return this.repo.find({
      where: { idAsociado },
      order: { nombre: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateFincaDto): Promise<Finca> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Finca not found');
  }
}