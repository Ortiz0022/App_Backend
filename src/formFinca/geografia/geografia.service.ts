import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Geografia } from './entities/geografia.entity';
import { CreateGeografiaDto } from './dto/create-geografia.dto';
import { UpdateGeografiaDto } from './dto/update-geografia.dto';

@Injectable()
export class GeografiaService {
  constructor(
    @InjectRepository(Geografia)
    private readonly geografiaRepository: Repository<Geografia>,
  ) {}

  async create(createDto: CreateGeografiaDto): Promise<Geografia> {
    const { provincia, canton, distrito, caserio } = createDto;

    // Verificar si ya existe una geografía con la misma combinación
    const existente = await this.geografiaRepository.findOne({
      where: {
        provincia,
        canton,
        distrito,
        caserio,
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe una geografía con esta combinación de ubicación',
      );
    }

    const geografia = this.geografiaRepository.create(createDto);
    return await this.geografiaRepository.save(geografia);
  }

  async findOrCreateInTransaction(
    dto: CreateGeografiaDto,
    manager: EntityManager,
  ): Promise<Geografia> {
    // Construir where dinámicamente
    const where: any = {
      provincia: dto.provincia,
      canton: dto.canton,
      distrito: dto.distrito,
    };
  
    // Solo agregar caserío si tiene valor (evita el problema de string | null)
    if (dto.caserio) {
      where.caserio = dto.caserio;
    }
  
    let geografia = await manager.findOne(Geografia, { where });
  
    if (!geografia) {
      geografia = manager.create(Geografia, {
        provincia: dto.provincia,
        canton: dto.canton,
        distrito: dto.distrito,
        caserio: dto.caserio,
      });
      await manager.save(geografia);
    }
  
    return geografia;
  }

  async findAll(): Promise<Geografia[]> {
    return await this.geografiaRepository.find({
      relations: ['fincas'],
      order: {
        provincia: 'ASC',
        canton: 'ASC',
        distrito: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Geografia> {
    const geografia = await this.geografiaRepository.findOne({
      where: { idGeografia: id },
      relations: ['fincas', 'fincas.asociado', 'fincas.propietario'],
    });

    if (!geografia) {
      throw new NotFoundException(`Geografía con ID ${id} no encontrada`);
    }

    return geografia;
  }

  async findByLocation(
    provincia: string,
    canton: string,
    distrito: string,
    caserio: string,
  ): Promise<Geografia> {
    const geografia = await this.geografiaRepository.findOne({
      where: {
        provincia,
        canton,
        distrito,
        caserio,
      },
      relations: ['fincas'],
    });

    if (!geografia) {
      throw new NotFoundException(
        'No se encontró una geografía con esa ubicación',
      );
    }

    return geografia;
  }

  async findByProvincia(provincia: string): Promise<Geografia[]> {
    return await this.geografiaRepository.find({
      where: { provincia },
      relations: ['fincas'],
      order: {
        canton: 'ASC',
        distrito: 'ASC',
      },
    });
  }

  async findByCanton(provincia: string, canton: string): Promise<Geografia[]> {
    return await this.geografiaRepository.find({
      where: { provincia, canton },
      relations: ['fincas'],
      order: {
        distrito: 'ASC',
      },
    });
  }

  async update(id: number, updateDto: UpdateGeografiaDto): Promise<Geografia> {
    const geografia = await this.findOne(id);

    // Si se actualizan los campos de ubicación, verificar duplicados
    if (
      updateDto.provincia ||
      updateDto.canton ||
      updateDto.distrito ||
      updateDto.caserio
    ) {
      const provincia = updateDto.provincia || geografia.provincia;
      const canton = updateDto.canton || geografia.canton;
      const distrito = updateDto.distrito || geografia.distrito;
      const caserio = updateDto.caserio || geografia.caserio;

      const existente = await this.geografiaRepository.findOne({
        where: { provincia, canton, distrito, caserio },
      });

      if (existente && existente.idGeografia !== id) {
        throw new ConflictException(
          'Ya existe una geografía con esta combinación de ubicación',
        );
      }
    }

    Object.assign(geografia, updateDto);
    return await this.geografiaRepository.save(geografia);
  }

  async remove(id: number): Promise<void> {
    const geografia = await this.geografiaRepository.findOne({
      where: { idGeografia: id },
      relations: ['fincas'],
    });

    if (!geografia) {
      throw new NotFoundException(`Geografía con ID ${id} no encontrada`);
    }

    // Verificar si tiene fincas asociadas
    if (geografia.fincas && geografia.fincas.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la geografía porque tiene fincas asociadas',
      );
    }

    await this.geografiaRepository.remove(geografia);
  }

  // Método auxiliar para obtener geografías con conteo de fincas
  async findAllWithFincasCount(): Promise<any[]> {
    const geografias = await this.geografiaRepository
      .createQueryBuilder('geografia')
      .leftJoin('geografia.fincas', 'finca')
      .loadRelationCountAndMap('geografia.fincasCount', 'geografia.fincas')
      .orderBy('geografia.provincia', 'ASC')
      .addOrderBy('geografia.canton', 'ASC')
      .addOrderBy('geografia.distrito', 'ASC')
      .getMany();

    return geografias;
  }

  // Método para obtener provincias únicas
  async getProvincias(): Promise<string[]> {
    const result = await this.geografiaRepository
      .createQueryBuilder('geografia')
      .select('DISTINCT geografia.provincia', 'provincia')
      .orderBy('geografia.provincia', 'ASC')
      .getRawMany();

    return result.map((r) => r.provincia);
  }

  // Método para obtener cantones por provincia
  async getCantonesByProvincia(provincia: string): Promise<string[]> {
    const result = await this.geografiaRepository
      .createQueryBuilder('geografia')
      .select('DISTINCT geografia.canton', 'canton')
      .where('geografia.provincia = :provincia', { provincia })
      .orderBy('geografia.canton', 'ASC')
      .getRawMany();

    return result.map((r) => r.canton);
  }

  // Método para obtener distritos por cantón
  async getDistritosByCanton(
    provincia: string,
    canton: string,
  ): Promise<string[]> {
    const result = await this.geografiaRepository
      .createQueryBuilder('geografia')
      .select('DISTINCT geografia.distrito', 'distrito')
      .where('geografia.provincia = :provincia', { provincia })
      .andWhere('geografia.canton = :canton', { canton })
      .orderBy('geografia.distrito', 'ASC')
      .getRawMany();

    return result.map((r) => r.distrito);
  }
}