import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { FaqDto } from './dto/FAQDto';


@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
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
    return newFaq;
  }

  deleteFaq(id: number) {
    return this.faqRepository.delete(id);
  }

  updateFaq(id: number, faqDto: FaqDto) {
    return this.faqRepository.update(id, faqDto);
  }
}
