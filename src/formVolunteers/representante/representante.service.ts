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
    private personaRepository: Repository<Persona>,
  ) {}

  // Método transaccional (usa EntityManager externo)
  async createInTransaction(
    createRepresentanteDto: CreateRepresentanteDto,
    organizacion: Organizacion,
    manager: EntityManager,
  ): Promise<Representante> {
    const repo = manager.getRepository(Representante);

    // 1) Reusar/crear Persona por cédula
    const persona = await this.personaService.createInTransaction(
      createRepresentanteDto.persona,
      manager,
    );

    // 2) REGLA NUEVA:
    //    Una persona NO puede ser representante de dos organizaciones.
    //    (Con tu OneToOne ya existe un UNIQUE en idPersona, pero aquí lo controlamos con 409 en vez de 500)
    const representanteExistente = await repo.findOne({
      where: { persona: { idPersona: persona.idPersona } as any },
      relations: ['organizacion', 'persona'],
    });

    if (representanteExistente) {
      const orgExistenteId = representanteExistente.organizacion?.idOrganizacion;
      const orgNuevaId = organizacion?.idOrganizacion;

      // Si ya estaba asignado a otra organización -> conflicto
      if (orgExistenteId && orgNuevaId && orgExistenteId !== orgNuevaId) {
        throw new ConflictException({
          code: 'REPRESENTANTE_YA_ASIGNADO',
          message:
            'Esta persona ya está registrada como representante de otra organización. No se permite ser representante de dos organizaciones.',
          meta: {
            idPersona: persona.idPersona,
            idOrganizacionActual: orgExistenteId,
            idOrganizacionIntento: orgNuevaId,
          },
        });
      }

      // Si es la misma organización -> idempotente (no duplicar)
      return representanteExistente;
    }

    // 3) Crear representante nuevo
    const representante = repo.create({
      persona,
      cargo: createRepresentanteDto.cargo,
      organizacion,
    });

    try {
      return await repo.save(representante);
    } catch (e: any) {
      // Por si hay condición de carrera y pega el UNIQUE en DB, igual devolvemos 409 bonito.
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException({
          code: 'REPRESENTANTE_YA_ASIGNADO',
          message:
            'Esta persona ya está registrada como representante de otra organización. No se permite ser representante de dos organizaciones.',
        });
      }
      throw e;
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

    const {
      nombre,
      apellido1,
      apellido2,
      telefono,
      email,
      direccion,
      ...representanteFields
    } = updateRepresentanteDto as any;

    // Actualizar campos de Persona si vienen
    if (
      nombre !== undefined ||
      apellido1 !== undefined ||
      apellido2 !== undefined ||
      telefono !== undefined ||
      email !== undefined ||
      direccion !== undefined
    ) {
      const personaUpdate: any = {};
      if (nombre !== undefined) personaUpdate.nombre = nombre;
      if (apellido1 !== undefined) personaUpdate.apellido1 = apellido1;
      if (apellido2 !== undefined) personaUpdate.apellido2 = apellido2;
      if (telefono !== undefined) personaUpdate.telefono = telefono;
      if (email !== undefined) personaUpdate.email = email;
      if (direccion !== undefined) personaUpdate.direccion = direccion;

      await this.personaRepository.update(
        representante.persona.idPersona,
        personaUpdate,
      );

      representante.persona =
        (await this.personaRepository.findOne({
          where: { idPersona: representante.persona.idPersona },
        })) ?? representante.persona;
    }

    if (representanteFields.cargo !== undefined) {
      representante.cargo = representanteFields.cargo;
    }

    const saved = await this.representanteRepository.save(representante);
    return this.findOne(saved.idRepresentante);
  }

 async validatePersonaDisponibleParaRepresentante(
    cedula: string,
    manager?: EntityManager,
  ): Promise<{
    ok: boolean;
    code?: string;
    message?: string;
    meta?: any;
  }> {
    const digits = String(cedula ?? "").replace(/\D/g, "").trim();
    if (!digits) return { ok: true };

    const personaRepo = manager ? manager.getRepository(Persona) : this.personaRepository;
    const repRepo = manager ? manager.getRepository(Representante) : this.representanteRepository;

    // 1) Si la persona no existe aún, entonces está disponible
    const persona = await personaRepo.findOne({ where: { cedula: digits } });
    if (!persona) return { ok: true };

    // 2) Si ya existe un representante ligado a esa persona, NO se permite otro
    const existente = await repRepo
      .createQueryBuilder("r")
      .leftJoin("r.persona", "p")
      .leftJoin("r.organizacion", "o")
      .addSelect(["o.idOrganizacion", "o.nombre", "o.cedulaJuridica", "o.email"])
      .where("p.idPersona = :idPersona", { idPersona: persona.idPersona })
      .getOne();

    if (existente) {
      return {
        ok: false,
        code: "REPRESENTANTE_YA_ASIGNADO",
        message:
          "Esta persona ya está registrada como representante de otra organización. No se permite ser representante de dos organizaciones.",
        meta: {
          idPersona: persona.idPersona,
          cedula: persona.cedula,
          idRepresentante: existente.idRepresentante,
          cargo: existente.cargo,
          organizacion: existente.organizacion
            ? {
                idOrganizacion: existente.organizacion.idOrganizacion,
                nombre: (existente.organizacion as any).nombre,
                cedulaJuridica: (existente.organizacion as any).cedulaJuridica,
                email: (existente.organizacion as any).email,
              }
            : null,
        },
      };
    }

    return { ok: true };
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
