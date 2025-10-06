import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { NucleoFamiliar } from './entities/nucleo-familiar.entity';
import { CreateNucleoFamiliarDto } from './dto/create-nucleo-familiar.dto';
import { UpdateNucleoFamiliarDto } from './dto/update-nucleo-familiar.dto';
import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
import { NucleoFamiliarDto } from './dto/nucleo-familiar-data.dto';

@Injectable()
export class NucleoFamiliarService {
  constructor(
    @InjectRepository(NucleoFamiliar)
    private readonly nucleoFamiliarRepository: Repository<NucleoFamiliar>,
    @InjectRepository(Associate)
    private readonly associateRepository: Repository<Associate>,
  ) {}

  private calcularTotal(hombres: number, mujeres: number): number {
    return hombres + mujeres;
  }

  // Método público (con validaciones)
  async create(createNucleoFamiliarDto: CreateNucleoFamiliarDto): Promise<NucleoFamiliar> {
    const { idAsociado, nucleoHombres, nucleoMujeres } = createNucleoFamiliarDto;

    const asociado = await this.associateRepository.findOne({
      where: { idAsociado },
      relations: ['nucleoFamiliar'],
    });

    if (!asociado) {
      throw new NotFoundException(`Asociado con ID ${idAsociado} no encontrado`);
    }

    if (asociado.nucleoFamiliar) {
      throw new ConflictException(
        'Este asociado ya tiene un núcleo familiar registrado',
      );
    }

    const nucleoTotal = this.calcularTotal(nucleoHombres, nucleoMujeres);

    const nuevoNucleoFamiliar = this.nucleoFamiliarRepository.create({
      nucleoHombres,
      nucleoMujeres,
      nucleoTotal,
      asociado,
    });

    return await this.nucleoFamiliarRepository.save(nuevoNucleoFamiliar);
  }

  createInTransaction(dto: NucleoFamiliarDto, manager: EntityManager): Promise<NucleoFamiliar> {
    const nucleoTotal = this.calcularTotal(dto.nucleoHombres, dto.nucleoMujeres);

    const nucleoFamiliar = manager.create(NucleoFamiliar, {
      nucleoHombres: dto.nucleoHombres,
      nucleoMujeres: dto.nucleoMujeres,
      nucleoTotal,
    });

    return manager.save(nucleoFamiliar);
  }

  async findAll(): Promise<NucleoFamiliar[]> {
    return await this.nucleoFamiliarRepository.find({
      relations: ['asociado', 'asociado.persona'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<NucleoFamiliar> {
    const nucleoFamiliar = await this.nucleoFamiliarRepository.findOne({
      where: { idNucleoFamiliar: id },
      relations: ['asociado', 'asociado.persona'],
    });

    if (!nucleoFamiliar) {
      throw new NotFoundException(`Núcleo familiar con ID ${id} no encontrado`);
    }

    return nucleoFamiliar;
  }

  async findByAsociado(idAsociado: number): Promise<NucleoFamiliar> {
    const nucleoFamiliar = await this.nucleoFamiliarRepository.findOne({
      where: { asociado: { idAsociado } },
      relations: ['asociado', 'asociado.persona'],
    });

    if (!nucleoFamiliar) {
      throw new NotFoundException(
        `Núcleo familiar para asociado con ID ${idAsociado} no encontrado`,
      );
    }

    return nucleoFamiliar;
  }

  async update(
    id: number,
    updateNucleoFamiliarDto: UpdateNucleoFamiliarDto,
  ): Promise<NucleoFamiliar> {
    const nucleoFamiliar = await this.findOne(id);

    const { nucleoHombres, nucleoMujeres } = updateNucleoFamiliarDto;

    if (nucleoHombres !== undefined) {
      nucleoFamiliar.nucleoHombres = nucleoHombres;
    }
    if (nucleoMujeres !== undefined) {
      nucleoFamiliar.nucleoMujeres = nucleoMujeres;
    }

    nucleoFamiliar.nucleoTotal = this.calcularTotal(
      nucleoFamiliar.nucleoHombres,
      nucleoFamiliar.nucleoMujeres,
    );

    return await this.nucleoFamiliarRepository.save(nucleoFamiliar);
  }

  async remove(id: number): Promise<void> {
    const nucleoFamiliar = await this.findOne(id);
    await this.nucleoFamiliarRepository.remove(nucleoFamiliar);
  }

  async getEstadisticas(): Promise<any> {
    const result = await this.nucleoFamiliarRepository
      .createQueryBuilder('nucleo')
      .select('SUM(nucleo.nucleoHombres)', 'totalHombres')
      .addSelect('SUM(nucleo.nucleoMujeres)', 'totalMujeres')
      .addSelect('SUM(nucleo.nucleoTotal)', 'totalPersonas')
      .addSelect('COUNT(nucleo.idNucleoFamiliar)', 'totalNucleos')
      .addSelect('AVG(nucleo.nucleoTotal)', 'promedioPersonasPorNucleo')
      .getRawOne();

    return {
      totalHombres: parseInt(result.totalHombres) || 0,
      totalMujeres: parseInt(result.totalMujeres) || 0,
      totalPersonas: parseInt(result.totalPersonas) || 0,
      totalNucleos: parseInt(result.totalNucleos) || 0,
      promedioPersonasPorNucleo: parseFloat(result.promedioPersonasPorNucleo) || 0,
    };
  }
}