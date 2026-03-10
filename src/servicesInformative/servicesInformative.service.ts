import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ServicesInformative } from "./entities/servicesInformative.entity";
import { Repository } from "typeorm";
import { ServicesInformativeDto } from "./dto/ServicesInformativeDto";
import { RealtimeGateway } from "src/realtime/realtime.gateway";

@Injectable()
export class ServicesInformativeService {
  constructor(
    @InjectRepository(ServicesInformative)
    private servicesInformativeRepository: Repository<ServicesInformative>,
    private readonly rt: RealtimeGateway,
  ) {}

findAll() {
  return this.servicesInformativeRepository.find();
}

async findOne(id: number) {
  return this.servicesInformativeRepository.findOneBy({ id });
}

async create(dto: ServicesInformativeDto) {
  const created = this.servicesInformativeRepository.create({
    ...dto,
    images: Array.isArray(dto.images) ? dto.images : [],
  });
  await this.servicesInformativeRepository.save(created);
  this.rt.emitServiceUpdated({ action: "created", data: created });
  return created;
}

async update(id: number, dto: ServicesInformativeDto) {
  await this.servicesInformativeRepository.update(id, {
    title: dto.title,
    cardDescription: dto.cardDescription,
    modalDescription: dto.modalDescription,
    images: Array.isArray(dto.images) ? dto.images : [] as any,
  });
  const updated = await this.servicesInformativeRepository.findOneBy({ id });
  if (!updated) return null;
  this.rt.emitServiceUpdated({ action: "updated", data: updated });
  return updated;
}

  async delete(id: number) {
    const idNum = Number(id);
    await this.servicesInformativeRepository.delete(idNum);
    this.rt.emitServiceUpdated({ action: "deleted", id: idNum });
    return { ok: true };
  }

  // Helper para parsear images de forma segura
  private parseImages(images: any): string[] {
    if (!images) return [];
    if (Array.isArray(images)) return images; // ya es array (tipo json de MySQL)
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}