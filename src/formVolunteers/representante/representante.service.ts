import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { Representante } from './entities/representante.entity';
import { PersonaService } from '../../formAssociates/persona/persona.service';
import { Organizacion } from '../organizacion/entities/organizacion.entity';

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representante)
    private representanteRepository: Repository<Representante>,
    private personaService: PersonaService,
  ) {}

  // Método transaccional (sin validaciones, usa EntityManager externo)
  async createInTransaction(
    createRepresentanteDto: CreateRepresentanteDto,
    organizacion: Organizacion,
    manager: EntityManager,
  ): Promise<Representante> {
    try {
      // Crear persona dentro de la transacción
      const persona = await this.personaService.createInTransaction(
        createRepresentanteDto.persona,
        manager,
      );

      // Crear representante
      const representante = manager.create(Representante, {
        persona,
        cargo: createRepresentanteDto.cargo,
        organizacion,
      });

      return manager.save(representante);
    } catch (error) {
      // Manejar error de duplicado
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('cedula')) {
          throw new ConflictException(
            `Ya existe una persona registrada con la cédula ${createRepresentanteDto.persona.cedula}`,
          );
        }
        if (error.message.includes('email')) {
          throw new ConflictException(
            `Ya existe una persona registrada con el email ${createRepresentanteDto.persona.email}`,
          );
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Representante[]> {
    return this.representanteRepository.find({
      relations: ['persona', 'organizacion'],
    });
  }

  async findOne(id: number): Promise<Representante> {
    const representante = await this.representanteRepository.findOne({
      where: { idRepresentante: id },
      relations: ['persona', 'organizacion'],
    });

    if (!representante) {
      throw new NotFoundException(`Representante con ID ${id} no encontrado`);
    }

    return representante;
  }

  async findByOrganizacion(idOrganizacion: number): Promise<Representante[]> {
    return this.representanteRepository.find({
      where: { organizacion: { idOrganizacion } },
      relations: ['persona'],
    });
  }

  async update(
    id: number,
    updateRepresentanteDto: UpdateRepresentanteDto,
  ): Promise<Representante> {
    const representante = await this.findOne(id);

    // Actualizar solo el cargo
    if (updateRepresentanteDto.cargo !== undefined) {
      representante.cargo = updateRepresentanteDto.cargo;
    }

    return this.representanteRepository.save(representante);
  }

  async remove(id: number): Promise<void> {
    const representante = await this.findOne(id);
    await this.representanteRepository.remove(representante);
  }
}