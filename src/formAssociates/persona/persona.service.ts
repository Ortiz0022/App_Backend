import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { CreatePersonaDto } from './dto/create-persona.dto';
  import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Persona } from './entities/persona.entity';
  
  @Injectable()
  export class PersonaService {
    constructor(
      @InjectRepository(Persona)
      private personaRepository: Repository<Persona>,
    ) {}
  
    async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
      // Verificar si ya existe una persona con esa cédula
      const existingByCedula = await this.personaRepository.findOne({
        where: { cedula: createPersonaDto.cedula },
      });
  
      if (existingByCedula) {
        throw new ConflictException(
          `Ya existe una persona con la cédula ${createPersonaDto.cedula}`,
        );
      }
  
      // Verificar si ya existe una persona con ese email
      const existingByEmail = await this.personaRepository.findOne({
        where: { email: createPersonaDto.email },
      });
  
      if (existingByEmail) {
        throw new ConflictException(
          `Ya existe una persona con el email ${createPersonaDto.email}`,
        );
      }
  
      const persona = this.personaRepository.create(createPersonaDto);
      return this.personaRepository.save(persona);
    }
  
    async findAll(): Promise<Persona[]> {
      return this.personaRepository.find({
        relations: ['asociado'],
      });
    }
  
    async findOne(id: number): Promise<Persona> {
      const persona = await this.personaRepository.findOne({
        where: { idPersona: id },
        relations: ['asociado'],
      });
  
      if (!persona) {
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }
  
      return persona;
    }
  
    async findByCedula(cedula: string): Promise<Persona> {
      const persona = await this.personaRepository.findOne({
        where: { cedula },
        relations: ['asociado'],
      });
  
      if (!persona) {
        throw new NotFoundException(`Persona con cédula ${cedula} no encontrada`);
      }
  
      return persona;
    }
  
    async findByEmail(email: string): Promise<Persona> {
      const persona = await this.personaRepository.findOne({
        where: { email },
        relations: ['asociado'],
      });
  
      if (!persona) {
        throw new NotFoundException(`Persona con email ${email} no encontrada`);
      }
  
      return persona;
    }
  
    async update(
      id: number,
      updatePersonaDto: UpdatePersonaDto,
    ): Promise<Persona> {
      const persona = await this.findOne(id);
  
      // Si se está actualizando el email, verificar que no exista
      if (updatePersonaDto.email && updatePersonaDto.email !== persona.email) {
        const existingByEmail = await this.personaRepository.findOne({
          where: { email: updatePersonaDto.email },
        });
  
        if (existingByEmail) {
          throw new ConflictException(
            `Ya existe una persona con el email ${updatePersonaDto.email}`,
          );
        }
      }
  
      Object.assign(persona, updatePersonaDto);
      return this.personaRepository.save(persona);
    }
  
    async remove(id: number): Promise<void> {
      const persona = await this.findOne(id);
  
      // Verificar si tiene un asociado vinculado
      if (persona.asociado) {
        throw new ConflictException(
          `No se puede eliminar la persona porque está asociada a un asociado activo`,
        );
      }
  
      await this.personaRepository.remove(persona);
    }
  }