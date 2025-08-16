import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ServicesInformative } from "./entities/servicesInformative.entity";
import { Repository } from "typeorm";
import { ServicesInformativeDto } from "./dto/ServicesInformativeDto";

@Injectable()
export class ServicesInformativeService {
  constructor(
    @InjectRepository(ServicesInformative)
    private servicesInformativeRepository: Repository<ServicesInformative>,
  ) {}

    // Métodos para ServicesInformative
    findAll() {
        return this.servicesInformativeRepository.find();
    }

    findOne(id: number) {
        return this.servicesInformativeRepository.findOneBy({ id });
    }

    async create(servicesInformativeDto: ServicesInformativeDto) {
        const newService = this.servicesInformativeRepository.create(servicesInformativeDto);
        await this.servicesInformativeRepository.save(newService);
        return newService;
    }

    delete(id: number) {
        return this.servicesInformativeRepository.delete(id);
    }

    update(id: number, servicesInformativeDto: ServicesInformativeDto) {
        return this.servicesInformativeRepository.update(id, servicesInformativeDto);
    }
}