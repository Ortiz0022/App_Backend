import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { FaqDto } from './dto/FAQDto';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';


@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
    private readonly realtime: RealtimeGateway, 
  ) {}

  findAllFaqs() {
    return this.faqRepository.find();
  }

  findOneFaq(id: number) {
    return this.faqRepository.findOneBy({ id });
  }

  async createFaq(faqDto: FaqDto) {
    const newFaq = this.faqRepository.create(faqDto);
    await this.faqRepository.save(newFaq);

    this.realtime.emitFaqUpdated({ action: 'created', data: newFaq });
    return newFaq;
  }

  async deleteFaq(id: number) {
    const idNum = Number(id);
    await this.faqRepository.delete(idNum);
    this.realtime.emitFaqUpdated({ action: 'deleted', id: idNum }); // <= número garantizado
    return { ok: true };
  }

  async updateFaq(id: number, faqDto: FaqDto) {
    await this.faqRepository.update(id, faqDto);
    const updated = await this.faqRepository.findOneBy({ id });

    this.realtime.emitFaqUpdated({ action: 'updated', data: updated });

    return updated;
  }
}
