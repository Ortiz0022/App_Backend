import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServicesInformative } from "./entities/servicesInformative.entity";
import { ServicesImage } from "./entities/servicesImage.entity";
import { ServicesInformativeDto } from "./dto/ServicesInformativeDto";
import { RealtimeGateway } from "src/realtime/realtime.gateway";

@Injectable()
export class ServicesInformativeService {
  constructor(
    @InjectRepository(ServicesInformative)
    private readonly servicesInformativeRepository: Repository<ServicesInformative>,

    @InjectRepository(ServicesImage)
    private readonly servicesImageRepository: Repository<ServicesImage>,

    private readonly rt: RealtimeGateway,
  ) {}

  private mapResponse(service: ServicesInformative | null) {
    if (!service) return null;

    return {
      id: service.id,
      title: service.title,
      cardDescription: service.cardDescription,
      modalDescription: service.modalDescription,
      images: service.serviceImages?.map((img) => img.imageUrl) ?? [],
    };
  }

async findAll() {
  return await this.servicesInformativeRepository.find({
    loadEagerRelations: false,
  });
}

  async findOne(id: number) {
    const service = await this.servicesInformativeRepository.findOne({
      where: { id },
    });

    return this.mapResponse(service);
  }

async create(dto: ServicesInformativeDto) {
  try {
    console.log("DTO recibido:", dto);

    const service = this.servicesInformativeRepository.create({
      title: dto.title,
      cardDescription: dto.cardDescription,
      modalDescription: dto.modalDescription,
    });

    const savedService = await this.servicesInformativeRepository.save(service);
    console.log("Servicio guardado:", savedService);

    console.log("Images:", dto.images);

    const imagesToSave = (dto.images ?? []).map((imageUrl) =>
      this.servicesImageRepository.create({
        imageUrl,
        serviceInformativeId: savedService.id,
      })
    );

    console.log("Images a guardar:", imagesToSave);

    if (imagesToSave.length > 0) {
      await this.servicesImageRepository.save(imagesToSave);
      console.log("Imágenes guardadas");
    }

    const created = await this.servicesInformativeRepository.findOne({
      where: { id: savedService.id },
    });

    console.log("Servicio final:", created);

    const response = this.mapResponse(created);
    this.rt.emitServiceUpdated({ action: "created", data: response });

    return response;
  } catch (error) {
    console.error("ERROR CREATE SERVICES:", error);
    throw error;
  }
}

  async update(id: number, dto: ServicesInformativeDto) {
    const existing = await this.servicesInformativeRepository.findOne({
      where: { id },
    });

    if (!existing) return null;

    existing.title = dto.title;
    existing.cardDescription = dto.cardDescription;
    existing.modalDescription = dto.modalDescription;

    await this.servicesInformativeRepository.save(existing);

    await this.servicesImageRepository.delete({
      serviceInformativeId: id,
    });

    const newImages = (dto.images ?? []).map((imageUrl) =>
      this.servicesImageRepository.create({
        imageUrl,
        serviceInformativeId: id,
      })
    );

    if (newImages.length > 0) {
      await this.servicesImageRepository.save(newImages);
    }

    const updated = await this.servicesInformativeRepository.findOne({
      where: { id },
    });

    const response = this.mapResponse(updated);
    this.rt.emitServiceUpdated({ action: "updated", data: response });

    return response;
  }

  async delete(id: number) {
    const idNum = Number(id);

    await this.servicesInformativeRepository.delete(idNum);

    this.rt.emitServiceUpdated({ action: "deleted", id: idNum });
    return { ok: true };
  }
}