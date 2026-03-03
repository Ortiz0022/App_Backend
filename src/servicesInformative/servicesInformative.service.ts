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

    // Métodos para ServicesInformative
    findAll() {
        return this.servicesInformativeRepository.find();
    }

    findOne(id: number) {
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

    async delete(id: number) {
        const idNum = Number(id);
        await this.servicesInformativeRepository.delete(idNum);    
        this.rt.emitServiceUpdated({ action: 'deleted', id: idNum });   
        return { ok: true };
    }

    async update(id: number, dto: ServicesInformativeDto) {
    await this.servicesInformativeRepository.update(id, {
        ...dto,
        images: Array.isArray(dto.images) ? dto.images : [],
    });
    const updated = await this.servicesInformativeRepository.findOneBy({ id });
    this.rt.emitServiceUpdated({ action: "updated", data: updated });
    return updated;
    }
}