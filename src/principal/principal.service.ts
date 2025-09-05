import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Principal } from './entities/principal.entity';
import { PrincipalDto } from './dto/PrincipalDto';
import { Event } from 'src/event/entities/event.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

@Injectable()
export class PrincipalService {
  constructor(
    @InjectRepository(Principal)
    private readonly principalRepository: Repository<Principal>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly rt: RealtimeGateway,
  ) {}

  // Listar todos (incluye relación con Event)
  findAllPrincipal() {
    return this.principalRepository.find({ relations: ['event'] });
  }

  // Obtener uno (incluye relación con Event)
  findOnePrincipal(id: number) {
    return this.principalRepository.findOne({ where: { id }, relations: ['event'] });
  }

  // Crear el único registro permitido
  async createPrincipal(dto: PrincipalDto) {
    // Asegurar "solo uno"
    const count = await this.principalRepository.count();
    if (count > 0) {
      throw new ConflictException('Ya existe un registro de principal');
    }

    // Normalizar datos y aplicar título por defecto si no viene
    const title = (dto as any).title?.toString().trim() || 'Cámara de Ganaderos de Hojancha';
    const description = (dto as any).description?.toString().trim() ?? '';

    const principal = this.principalRepository.create({ title, description });

    // Asignar Event si viene eventId
    const eventIdRaw = (dto as any).eventId;
    if (eventIdRaw !== undefined && eventIdRaw !== null) {
      const eventId = Number(eventIdRaw);
      const event = await this.eventRepository.findOne({ where: { id: eventId } });
      if (!event) throw new NotFoundException('Event not found');
      principal.event = event;
    }

    const saved = await this.principalRepository.save(principal);

    // Tiempo real
    this.rt.emitPrincipalUpdated({ action: 'created', data: saved });

    return saved;
  }

  // Actualizar (permite cambiar descripción/título y, si quieres, el Event)
  async updatePrincipal(id: number, principalDto: PrincipalDto) {
    const idNum = Number(id);

    // Construir payload parcial para evitar sobrescribir con undefined
    const payload: Partial<Principal> = {};
    const t = (principalDto as any).title;
    const d = (principalDto as any).description;
    if (typeof t === 'string') payload.title = t;
    if (typeof d === 'string') payload.description = d;

    // Manejar cambio de eventId si viene
    const eventIdRaw = (principalDto as any).eventId;
    if (eventIdRaw !== undefined && eventIdRaw !== null) {
      const eventId = Number(eventIdRaw);
      const event = await this.eventRepository.findOne({ where: { id: eventId } });
      if (!event) throw new NotFoundException('Event not found');
      payload.event = event;
    }

    await this.principalRepository.update(idNum, payload);

    // Opcional: leer el actualizado para emitirlo completo
    const updated = await this.findOnePrincipal(idNum);
    this.rt.emitPrincipalUpdated({ action: 'updated', data: updated ?? { id: idNum } });

    return { ok: true };
  }

  // Eliminar
  async deletePrincipal(id: number) {
    const idNum = Number(id);
    await this.principalRepository.delete(idNum);

    // Tiempo real
    this.rt.emitPrincipalUpdated({ action: 'deleted', id: idNum });

    return { ok: true };
  }
}
