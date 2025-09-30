import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
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

  async create(dto: CreateAssociateDto): Promise<Associate> {
    try {
      const entity = this.repo.create({
        ...dto,
        estado: dto.estado ?? AssociateStatus.PENDIENTE,
      });
      return await this.repo.save(entity);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).code === '23505') {
        throw new ConflictException('La cédula o el email ya están registrados');
      }
      if ((e as any).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('La cédula o el email ya están registrados');
      }
      throw e;
    }
  }

  async findAll(query: QueryAssociateDto) {
    const { status, search, page = 1, limit = 20, sort } = query;

    const allowedSortFields = new Set([
      'createdAt', 'nombre', 'apellido1', 'apellido2', 'cedula', 'email', 'estado',
    ]);

    let [sortField = 'createdAt', sortDir = 'desc'] = (sort ?? 'createdAt:desc').split(':');
    sortField = allowedSortFields.has(sortField) ? sortField : 'createdAt';
    const direction: 'ASC' | 'DESC' = sortDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.repo.createQueryBuilder('a');

    if (status) {
      qb.andWhere('a.estado = :status', { status });
    }

    if (search) {
       const q = `%${search.toLowerCase()}%`;
       qb.andWhere(`LOWER(a.nombre) LIKE :q
                 OR LOWER(a.apellido1) LIKE :q
                 OR LOWER(a.apellido2) LIKE :q
                 OR LOWER(a.cedula) LIKE :q
                 OR LOWER(a.email)  LIKE :q`, { q });
    }

    qb.orderBy(`a.${sortField}`, direction)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
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

  async changeStatus(id: number, { estado, motivo }: ChangeStatusDto): Promise<Associate> {
    const entity = await this.findOne(id);
    entity.estado = estado;
    entity.motivoRechazo = estado === AssociateStatus.RECHAZADO ? motivo : undefined;
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Associate not found');
  }
}
