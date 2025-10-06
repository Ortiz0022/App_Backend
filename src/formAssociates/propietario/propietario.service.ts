import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Propietario } from './entities/propietario.entity';
import { CreatePropietarioDto } from './dto/create-propietario.dto';

import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';
import { PersonaService } from '../persona/persona.service';

@Injectable()
export class PropietarioService {
  constructor(
    @InjectRepository(Propietario)
    private readonly propietarioRepository: Repository<Propietario>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    private personaService: PersonaService,
  ) {}

  async create(createPropietarioDto: CreatePropietarioDto): Promise<Propietario> {
    const { persona: personaData } = createPropietarioDto;
  
    let persona = await this.personaRepository.findOne({
      where: { cedula: personaData.cedula },
      relations: ['propietario'],
    });
  
    if (persona) {
      // Si ya es propietario, devolverlo (NO lanzar error)
      if (persona.propietario) {
        return persona.propietario;
      }
  
      // Si existe pero no es propietario, crear el registro
      const nuevoPropietario = this.propietarioRepository.create({
        persona: persona,
      });
  
      return await this.propietarioRepository.save(nuevoPropietario);
    }
  
    // Si no existe, crear ambos
    const nuevaPersona = this.personaRepository.create(personaData);
    const personaGuardada = await this.personaRepository.save(nuevaPersona);
  
    const nuevoPropietario = this.propietarioRepository.create({
      persona: personaGuardada,
    });
  
    return await this.propietarioRepository.save(nuevoPropietario);
  }

  async createInTransaction(
    personaData: any,
    manager: EntityManager,
  ): Promise<Propietario> {
    // Buscar si la persona ya existe
    let persona = await manager.findOne(Persona, {
      where: { cedula: personaData.cedula },
      relations: ['propietario'],
    });
  
    if (persona) {
      // Si ya es propietario, devolverlo (NO lanzar error)
      if (persona.propietario) {
        return persona.propietario;
      }
      
      // Si existe pero no es propietario, crear propietario
      const propietario = manager.create(Propietario, {
        persona,
      });
      return manager.save(propietario);
    }
  
    // Si no existe, crear persona y propietario
    const nuevaPersona = manager.create(Persona, personaData);
    const personaGuardada = await manager.save(nuevaPersona);
  
    const propietario = manager.create(Propietario, {
      persona: personaGuardada,
    });
  
    return manager.save(propietario);
  }

  async findAll(): Promise<Propietario[]> {
    return await this.propietarioRepository.find({
      relations: ['persona', 'fincas'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Propietario> {
    const propietario = await this.propietarioRepository.findOne({
      where: { idPropietario: id },
      relations: ['persona', 'fincas'],
    });

    if (!propietario) {
      throw new NotFoundException(`Propietario con ID ${id} no encontrado`);
    }

    return propietario;
  }

  async findByPersonaId(personaId: number): Promise<Propietario> {
    const propietario = await this.propietarioRepository.findOne({
      where: { persona: { idPersona: personaId } },
      relations: ['persona', 'fincas'],
    });

    if (!propietario) {
      throw new NotFoundException(
        `Propietario con persona ID ${personaId} no encontrado`,
      );
    }

    return propietario;
  }

  async findByCedula(cedula: string): Promise<Propietario> {
    const propietario = await this.propietarioRepository.findOne({
      where: { persona: { cedula } },
      relations: ['persona', 'fincas'],
    });

    if (!propietario) {
      throw new NotFoundException(
        `Propietario con cédula ${cedula} no encontrado`,
      );
    }

    return propietario;
  }

  async update(
    id: number,
    updatePropietarioDto: UpdatePropietarioDto,
  ): Promise<Propietario> {
    const propietario = await this.findOne(id);

    if (updatePropietarioDto.persona) {
      const { persona: personaData } = updatePropietarioDto;

      // Verificar si otra persona ya usa la cédula o email (excluyendo la persona actual)
      if (personaData.cedula || personaData.email) {
        const personaExistente = await this.personaRepository.findOne({
          where: [
            { cedula: personaData.cedula },
            { email: personaData.email },
          ],
        });

        if (
          personaExistente &&
          personaExistente.idPersona !== propietario.persona.idPersona
        ) {
          throw new ConflictException(
            'La cédula o email ya están registrados por otra persona',
          );
        }
      }

      // Actualizar datos de persona
      await this.personaRepository.update(
        propietario.persona.idPersona,
        personaData,
      );
    }

    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const propietario = await this.propietarioRepository.findOne({
      where: { idPropietario: id },
      relations: ['fincas'],
    });

    if (!propietario) {
      throw new NotFoundException(`Propietario con ID ${id} no encontrado`);
    }

    // Verificar si tiene fincas asociadas
    if (propietario.fincas && propietario.fincas.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el propietario porque tiene fincas asociadas',
      );
    }

    await this.propietarioRepository.remove(propietario);
  }

  // Método auxiliar para obtener propietarios con conteo de fincas
  async findAllWithFincasCount(): Promise<any[]> {
    const propietarios = await this.propietarioRepository
      .createQueryBuilder('propietario')
      .leftJoinAndSelect('propietario.persona', 'persona')
      .leftJoin('propietario.fincas', 'finca')
      .loadRelationCountAndMap('propietario.fincasCount', 'propietario.fincas')
      .orderBy('propietario.createdAt', 'DESC')
      .getMany();

    return propietarios;
  }
}