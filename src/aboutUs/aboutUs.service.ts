import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AboutUs } from "./entities/aboutUs.entity";
import { AboutUsDto } from "./dto/AboutUsDto";
import { AboutUsPatchDto } from "./dto/AboutUsPatchDto";
import { RealtimeGateway } from "src/realtime/realtime.gateway";

@Injectable()
export class AboutUsService {
  constructor(
    @InjectRepository(AboutUs)
    private aboutUsRepository: Repository<AboutUs>,
    private readonly rt: RealtimeGateway,
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
        await this.aboutUsRepository.save(exists);
        return this.aboutUsRepository.findOneBy({ id });
    }

    async delete(id: number) {
      const idNum = Number(id);
      await this.aboutUsRepository.delete(idNum);
      this.rt.emitAboutUsUpdated({ action: 'deleted', id: idNum }); // <= número garantizado
      return { ok: true };
    }

   
      async update(id: number, dto: AboutUsDto) {
        await this.aboutUsRepository.update(id, dto);
        const updated = await this.aboutUsRepository.findOneBy({ id });
        this.rt.emitAboutUsUpdated({ action: 'updated', data: updated });
        return updated;
      } 

}