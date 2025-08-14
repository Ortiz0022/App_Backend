import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Principal } from './entities/principal.entity';
import { PrincipalDto } from './dto/PrincipalDto';
import { Event } from 'src/event/entities/event.entity';
 
@Injectable()
export class PrincipalService {
  roleRepository: any;
  constructor(
    @InjectRepository(Principal)
    private readonly principalRepository: Repository<Principal>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  // Métodos para Principal
  findAllPrincipal() {
    return this.principalRepository.find({ relations: ['event'] });
  }

  findOnePrincipal(id: number) {
    return this.principalRepository.findOne({ where: { id }, relations: ['event'] });
  }

   async createPrincipal(dto: PrincipalDto) {
    const { eventId, ...rest } = dto;

    const principal = this.principalRepository.create({
      ...rest,
    });

    if (eventId != null) {
      const event = await this.eventRepository.findOne({ where: { id: eventId } });
      if (!event) throw new NotFoundException('Event not found');
      principal.event = event; // asigna FK
    }

    return this.principalRepository.save(principal);
  }

  deletePrincipal(id: number) {
    return this.principalRepository.delete(id);
  }

  updatePrincipal(id: number, principalDto: PrincipalDto) {
    return this.principalRepository.update(id, principalDto);
  }
}