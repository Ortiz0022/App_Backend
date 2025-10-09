import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Repository } from 'typeorm';
import { ActividadAgropecuaria } from './entities/actividad.entity';
import { Finca } from '../finca/entities/finca.entity';
import { CreateActividadDto } from './dto/create-actividad';
import { UpdateActividadDto } from './dto/update-actividad';


@Injectable()
export class ActividadesAgropecuariasService {
  constructor(
    @InjectRepository(ActividadAgropecuaria)
    private readonly repo: Repository<ActividadAgropecuaria>,
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,
  ) {}

  async create(dto: CreateActividadDto) {
    // validar finca
    const finca = await this.fincaRepo.findOne({ where: { idFinca: dto.idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    // evitar duplicado (finca + nombre)
    const exists = await this.repo.findOne({
      where: { idFinca: dto.idFinca, nombre: dto.nombre },
    });
    if (exists) throw new BadRequestException('Esta actividad ya existe en la finca');

    const entity = this.repo.create({ ...dto, finca });
    return this.repo.save(entity);
  }

  async createManyInTransaction(
    actividades: CreateActividadDto[],
    finca: Finca,
    manager: EntityManager,
  ): Promise<ActividadAgropecuaria[]> {
    console.log('🔍 Datos recibidos:', { actividades, fincaId: finca.idFinca }); // ✅ Debug
  
    if (!actividades || actividades.length === 0) {
      console.log('⚠️ Array vacío'); // ✅ Debug
      return [];
    }
  
    const actividadEntities = actividades.map((dto) => {
      console.log('🔍 Creando entidad:', dto); // ✅ Debug
      return manager.create(ActividadAgropecuaria, {
        nombre: dto.nombre,
        finca,
        idFinca: finca.idFinca,
      });
    });
  
    console.log('🔍 Entidades antes de guardar:', actividadEntities); // ✅ Debug
  
    const saved = await manager.save(actividadEntities);
    
    console.log('✅ Actividades guardadas:', saved); // ✅ Debug
  
    return saved;
  }
  // listado general con filtros opcionales
  async findAll(params?: { idFinca?: number; search?: string }) {
    const where: any = {};
    if (params?.idFinca) where.idFinca = params.idFinca;

    if (params?.search) {
      const needle = ILike(`%${params.search}%`);
      return this.repo.find({
        where: [{ ...where, nombre: needle }],
        order: { idActividad: 'DESC' },
      });
    }

    return this.repo.find({ where, order: { idActividad: 'DESC' } });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { idActividad: id } });
    if (!item) throw new NotFoundException('Actividad agropecuaria no encontrada');
    return item;
  }

  async listByFinca(idFinca: number) {
    const finca = await this.fincaRepo.findOne({ where: { idFinca } });
    if (!finca) throw new NotFoundException('Finca no encontrada');

    return this.repo.find({
      where: { idFinca },
      order: { idActividad: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateActividadDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Actividad agropecuaria no encontrada');
  }
}
