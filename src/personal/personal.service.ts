import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalDto } from './dto/PersonalDto';
import { PersonaService } from 'src/formAssociates/persona/persona.service';
import { Persona } from 'src/formAssociates/persona/entities/persona.entity';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
    private readonly personaService: PersonaService,
    private readonly dataSource: DataSource,
  ) {}

  private todayLocalISO(): string {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
  }

  private toPersonaPayload(dto: PersonalDto) {
    return {
      cedula: dto.IDE,
      nombre: dto.name,
      apellido1: dto.lastname1,
      apellido2: dto.lastname2,
      fechaNacimiento: dto.birthDate,
      telefono: dto.phone,
      email: dto.email,
      direccion: dto.direction,
    };
  }

  private toResponse(personal: Personal) {
    return {
      id: personal.id,
      IdUser: personal.id,
      personaId: personal.personaId,

      IDE: personal.persona?.cedula ?? '',
      name: personal.persona?.nombre ?? '',
      lastname1: personal.persona?.apellido1 ?? '',
      lastname2: personal.persona?.apellido2 ?? '',
      birthDate: personal.persona?.fechaNacimiento ?? '',
      phone: personal.persona?.telefono ?? '',
      email: personal.persona?.email ?? '',
      direction: personal.persona?.direccion ?? '',

      occupation: personal.occupation,
      isActive: personal.isActive,
      startWorkDate: personal.startWorkDate,
      endWorkDate: personal.endWorkDate,
    };
  }

  private normalizeDates(dto: PersonalDto): PersonalDto {
    const copy: PersonalDto = { ...dto };

    if (typeof copy.startWorkDate === 'string') {
      const s = copy.startWorkDate.trim();
      if (!s) {
        delete (copy as any).startWorkDate;
      } else {
        copy.startWorkDate = s;
      }
    }

    if (copy.isActive === true) {
      copy.endWorkDate = null;
    } else {
      if (
        copy.endWorkDate == null ||
        copy.endWorkDate.toString().trim() === ''
      ) {
        copy.endWorkDate = this.todayLocalISO();
      } else {
        copy.endWorkDate = copy.endWorkDate.toString().trim();
      }
    }

    return copy;
  }

  async findAllPersonal() {
    const rows = await this.personalRepository.find();
    return rows.map((row) => this.toResponse(row));
  }

  async findOnePersonal(id: number) {
    const personal = await this.personalRepository.findOne({
      where: { id },
    });

    if (!personal) {
      throw new NotFoundException('Personal not found');
    }

    return this.toResponse(personal);
  }

  async createPersonal(dto: PersonalDto) {
    const normalized = this.normalizeDates(dto);

    return this.dataSource.transaction(async (manager) => {
      const persona = await this.personaService.createInTransaction(
        this.toPersonaPayload(normalized) as any,
        manager,
      );

      const existingPersonal = await manager.getRepository(Personal).findOne({
        where: { personaId: persona.idPersona },
      });

      if (existingPersonal) {
        throw new ConflictException(
          `La persona con cédula ${persona.cedula} ya está registrada como personal`,
        );
      }

      const personal = manager.getRepository(Personal).create({
        personaId: persona.idPersona,
        occupation: normalized.occupation,
        isActive: normalized.isActive,
        startWorkDate: normalized.startWorkDate ?? null,
        endWorkDate: normalized.endWorkDate ?? null,
      });

      const saved = await manager.getRepository(Personal).save(personal);

      const full = await manager.getRepository(Personal).findOne({
        where: { id: saved.id },
        relations: ['persona'],
      });

      if (!full) {
        throw new NotFoundException('Personal not found after save');
      }

      return this.toResponse(full);
    });
  }

  async deletePersonal(id: number) {
    const personal = await this.personalRepository.findOne({ where: { id } });

    if (!personal) {
      throw new NotFoundException('Personal not found');
    }

    await this.personalRepository.remove(personal);

    return { message: 'Registro de personal eliminado correctamente' };
  }

  async updatePersonal(id: number, dto: PersonalDto) {
    const normalized = this.normalizeDates(dto);

    return this.dataSource.transaction(async (manager) => {
      const personalRepo = manager.getRepository(Personal);
      const personaRepo = manager.getRepository(Persona);

      const personal = await personalRepo.findOne({
        where: { id },
        relations: ['persona'],
      });

      if (!personal) {
        throw new NotFoundException('Personal not found');
      }

      const persona = personal.persona;

      const existingByCedula = await personaRepo.findOne({
        where: { cedula: normalized.IDE },
      });

      if (existingByCedula && existingByCedula.idPersona !== persona.idPersona) {
        throw new ConflictException('Ya existe otra persona con esa cédula');
      }

      const existingByEmail = await personaRepo.findOne({
        where: { email: normalized.email },
      });

      if (existingByEmail && existingByEmail.idPersona !== persona.idPersona) {
        throw new ConflictException('Ya existe otra persona con ese email');
      }

      persona.cedula = normalized.IDE;
      persona.nombre = normalized.name;
      persona.apellido1 = normalized.lastname1;
      persona.apellido2 = normalized.lastname2;
      persona.fechaNacimiento = normalized.birthDate;
      persona.telefono = normalized.phone;
      persona.email = normalized.email;
      persona.direccion = normalized.direction;

      await manager.save(persona);

      personal.occupation = normalized.occupation;
      personal.isActive = normalized.isActive;
      personal.startWorkDate = normalized.startWorkDate ?? null;
      personal.endWorkDate = normalized.endWorkDate ?? null;

      const saved = await personalRepo.save(personal);

      const full = await personalRepo.findOne({
        where: { id: saved.id },
        relations: ['persona'],
      });

      if (!full) {
        throw new NotFoundException('Personal not found after update');
      }

      return this.toResponse(full);
    });
  }
}