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
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representante)
    private representanteRepository: Repository<Representante>,
    private personaService: PersonaService,
      @InjectRepository(Persona)
    private personaRepository: Repository<Persona>
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

    // Extraer campos que pertenecen a Persona
    const { nombre, apellido1, apellido2, telefono, email, direccion, ...representanteFields } = updateRepresentanteDto;

    // Actualizar campos de Persona si existen
    if (nombre !== undefined || apellido1 !== undefined || apellido2 !== undefined ||
        telefono !== undefined || email !== undefined || direccion !== undefined) {
      const personaUpdate: any = {};
      if (nombre !== undefined) personaUpdate.nombre = nombre;
      if (apellido1 !== undefined) personaUpdate.apellido1 = apellido1;
      if (apellido2 !== undefined) personaUpdate.apellido2 = apellido2;
      if (telefono !== undefined) personaUpdate.telefono = telefono;
      if (email !== undefined) personaUpdate.email = email;
      if (direccion !== undefined) personaUpdate.direccion = direccion;

      await this.personaRepository.update(
        representante.persona.idPersona,
        personaUpdate
      );

      // RECARGAR la persona después de actualizarla
      representante.persona = await this.personaRepository.findOne({
        where: { idPersona: representante.persona.idPersona },
      }) || representante.persona;
    }

    // Actualizar campos del representante (solo cargo)
    if (representanteFields.cargo !== undefined) {
      representante.cargo = representanteFields.cargo;
    }

    // Guardar representante
    const savedRepresentante = await this.representanteRepository.save(representante);

    // Retornar con todas las relaciones recargadas
    return this.findOne(savedRepresentante.idRepresentante);
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

  async remove(id: number): Promise<void> {
    const representante = await this.findOne(id);
    await this.representanteRepository.remove(representante);
  }
}