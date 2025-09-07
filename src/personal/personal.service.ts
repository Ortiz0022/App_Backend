import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalDto } from './dto/PersonalDto';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
  ) {}

  private todayLocalISO(): string {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
  }

  private normalizeDates(dto: PersonalDto): PersonalDto {
    const copy: PersonalDto = { ...dto };

    if (typeof copy.startWorkDate === 'string') {
      const s = copy.startWorkDate.trim();
      if (!s) {
        delete (copy as any).startWorkDate;
      } else {
        copy.startWorkDate = s;
      }
    }

    if (copy.isActive === true) {
      copy.endWorkDate = null;
    } else {
      if (copy.endWorkDate == null || copy.endWorkDate.toString().trim() === '') {
        copy.endWorkDate = this.todayLocalISO();
      } else {
        copy.endWorkDate = copy.endWorkDate.toString().trim();
      }
    }

    return copy;
  }

  findAllPersonal() {
    return this.personalRepository.find();
  }


  findOnePersonal(id: number) {
    return this.personalRepository.findOne({ where: { id } });
  }

  async createPersonal(dto: PersonalDto) {
    const normalized = this.normalizeDates(dto);
    const { UserId, ...data } = normalized as any;

    const personal = this.personalRepository.create(data);
    return this.personalRepository.save(personal);
  }

  deletePersonal(id: number) {
    return this.personalRepository.delete(id);
  }

  async updatePersonal(id: number, dto: PersonalDto) {
    const personal = await this.personalRepository.findOne({ where: { id } });
    if (!personal) throw new NotFoundException('Personal not found');

    const normalized = this.normalizeDates(dto);
    const { UserId, ...data } = normalized as any; 

    Object.assign(personal, data);
    return this.personalRepository.save(personal);
  }
}
