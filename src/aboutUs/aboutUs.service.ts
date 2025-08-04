import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AboutUs } from "./entities/aboutUs.entity";
import { AboutUsDto } from "./dto/AboutUsDto";

@Injectable()
export class AboutUsService {
  constructor(
    @InjectRepository(AboutUs)
    private aboutUsRepository: Repository<AboutUs>,
  ) {}

    findAllAboutUs() {
    return this.aboutUsRepository.find();
    }

    findOneAboutUs(id: number) {
    return this.aboutUsRepository.findOneBy({ id });
    }

    async createAboutUs(aboutUsDto: AboutUsDto) {
        const newAboutUs = this.aboutUsRepository.create(aboutUsDto);
        await this.aboutUsRepository.save(newAboutUs);
        return newAboutUs;
    }

    deleteAboutUs(id: number) {
        return this.aboutUsRepository.delete(id);
    }

    updateAboutUs(id: number, aboutUsDto: AboutUs) {
        return this.aboutUsRepository.update(id, aboutUsDto);
    }   

}