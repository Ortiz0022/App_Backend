import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateAssociateDto } from './dto/create-associate.dto';
import { UpdateAssociateDto } from './dto/update-associate.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QueryAssociateDto } from './dto/query-associate.dto';
import { Associate } from './entities/associate.entity';
import { AssociateStatus } from './dto/associate-status.enum';

@Injectable()
export class AssociatesService {
  constructor(
    @InjectRepository(Associate)
    private readonly repo: Repository<Associate>,
  ) {}

  // Solicitud desde el front público → queda PENDIENTE por defecto
  async create(dto: CreateAssociateDto): Promise<Associate> {
    const entity = this.repo.create({
      ...dto,
      estado: dto.estado ?? AssociateStatus.PENDIENTE,
    });
    return this.repo.save(entity);
  }

  async findAll(query: QueryAssociateDto): Promise<Associate[]> {
    const where: any = {};
    if (query.status) where.estado = query.status;

    if (query.search) {
      // búsqueda simple por varios campos (OR)
      const needle = ILike(`%${query.search}%`);
      return this.repo.find({
        where: [
          { ...where, nombre: needle },
          { ...where, apellido1: needle },
          { ...where, apellido2: needle },
          { ...where, cedula: needle },
          { ...where, email: needle },
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Associate> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Associate not found');
    return item;
  }

  async update(id: number, dto: UpdateAssociateDto): Promise<Associate> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async changeStatus(id: number, { estado }: ChangeStatusDto): Promise<Associate> {
    const entity = await this.findOne(id);
    entity.estado = estado;
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Associate not found');
  }
}
