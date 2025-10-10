import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

  /**
   * ✅ NUEVO MÉTODO: Link por ID (usado internamente)
   * Recibe objetos con { idFinca, idInfraestructura }
   */
  async linkManyInTransaction(
    infraestructuras: CreateFincaInfraestructuraDto[],
    finca: Finca,
    manager: EntityManager,
  ): Promise<FincaInfraestructura[]> {
    if (!infraestructuras || infraestructuras.length === 0) {
      return [];
    }

    const links: FincaInfraestructura[] = [];

    for (const dto of infraestructuras) {
      const infraestructura = await manager.findOne(Infraestructura, {
        where: { idInfraestructura: dto.idInfraestructura },
      });

      if (!infraestructura) {
        throw new NotFoundException(
          `Infraestructura con ID ${dto.idInfraestructura} no encontrada`,
        );
      }

      // ✅ Verificar si ya existe la relación antes de insertar
      const existingLink = await manager.findOne(FincaInfraestructura, {
        where: {
          idFinca: finca.idFinca,
          idInfraestructura: infraestructura.idInfraestructura,
        },
      });

      if (!existingLink) {
        const link = manager.create(FincaInfraestructura, {
          idFinca: finca.idFinca,
          idInfraestructura: infraestructura.idInfraestructura,
          finca,
          infraestructura,
        });

        links.push(link);
      } else {
        console.log(
          `[FincaInfraestructura] Relación ya existe: Finca ${finca.idFinca} - Infraestructura ${infraestructura.idInfraestructura}`,
        );
      }
    }

    if (links.length > 0) {
      return manager.save(links);
    }

    return [];
  }

  /**
   * ✅ NUEVO MÉTODO: Link por nombre (usado desde el formulario de asociados)
   * Recibe objetos con { nombre: string }
   * Busca o crea la infraestructura por nombre y luego crea la relación
   */
  async linkManyByNameInTransaction(
    infraestructurasDto: Array<{ nombre: string }>,
    finca: Finca,
    manager: EntityManager,
  ): Promise<FincaInfraestructura[]> {
    if (!infraestructurasDto || infraestructurasDto.length === 0) {
      return [];
    }

    const links: FincaInfraestructura[] = [];

    for (const infraDto of infraestructurasDto) {
      // 1. Buscar o crear infraestructura por nombre
      let infraestructura = await manager.findOne(Infraestructura, {
        where: { nombre: infraDto.nombre },
      });

      if (!infraestructura) {
        console.log(`[FincaInfraestructura] Creando nueva infraestructura: ${infraDto.nombre}`);
        infraestructura = manager.create(Infraestructura, {
          nombre: infraDto.nombre,
        });
        await manager.save(infraestructura);
      }

      // 2. ✅ Verificar si ya existe la relación
      const existingLink = await manager.findOne(FincaInfraestructura, {
        where: {
          idFinca: finca.idFinca,
          idInfraestructura: infraestructura.idInfraestructura,
        },
      });

      // 3. Solo crear el link si no existe
      if (!existingLink) {
        const link = manager.create(FincaInfraestructura, {
          idFinca: finca.idFinca,
          idInfraestructura: infraestructura.idInfraestructura,
          finca,
          infraestructura,
        });

        links.push(link);
      } else {
        console.log(
          `[FincaInfraestructura] Relación ya existe: Finca ${finca.idFinca} - Infraestructura "${infraestructura.nombre}" (${infraestructura.idInfraestructura})`,
        );
      }
    }

    if (links.length > 0) {
      return manager.save(links);
    }

    return [];
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