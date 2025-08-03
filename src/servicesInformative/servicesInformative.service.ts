import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ServicesInformative } from "./entities/servicesInformative.entity";
import { Repository } from "typeorm";

@Injectable()
export class ServicesInformativeService {
  constructor(
    @InjectRepository(ServicesInformative)
    private servicesInformativeRepository: Repository<ServicesInformative>,
  ) {}

    // Métodos para ServicesInformative
    findAllServicesInformative() {
        return this.servicesInformativeRepository.find();
    }

    findOneServicesInformative(id: number) {
        return this.servicesInformativeRepository.findOneBy({ id });
    }

    async createServicesInformative(servicesInformativeDto: any) {
        const newService = this.servicesInformativeRepository.create(servicesInformativeDto);
        await this.servicesInformativeRepository.save(newService);
        return newService;
    }

    deleteServicesInformative(id: number) {
        return this.servicesInformativeRepository.delete(id);
    }

    updateServicesInformative(id: number, servicesInformativeDto: any) {
        return this.servicesInformativeRepository.update(id, servicesInformativeDto);
    }
}