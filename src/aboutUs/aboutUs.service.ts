import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AboutUs } from "./entities/aboutUs.entity";
import { AboutUsDto } from "./dto/AboutUsDto";
import { AboutUsPatchDto } from "./dto/AboutUsPatchDto";

@Injectable()
export class AboutUsService {
  constructor(
    @InjectRepository(AboutUs)
    private aboutUsRepository: Repository<AboutUs>,
  ) {}

    findAll() {
    return this.aboutUsRepository.find();
    }

    findOne(id: number) {
    return this.aboutUsRepository.findOneBy({ id });
    }

    async create(aboutUsDto: AboutUsDto) {
        const newAboutUs = this.aboutUsRepository.create(aboutUsDto);
        await this.aboutUsRepository.save(newAboutUs);
        return newAboutUs;
    }

    // Partially update an existing About Us entry
    async patch(id: number, dto: AboutUsPatchDto) {
      const exists = await this.aboutUsRepository.findOneBy({ id });

      if (!exists) {
        throw new Error('About Us not found');
      }

        await this.aboutUsRepository.update(id, dto);
        return this.aboutUsRepository.findOneBy({ id });
    }

    delete(id: number) {
        return this.aboutUsRepository.delete(id);
    }

    update(id: number, aboutUsDto: AboutUs) {
        return this.aboutUsRepository.update(id, aboutUsDto);
    }   

}