import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqDto } from './dto/FAQDto';


@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  create(@Body() createFaqDto: FaqDto) {
    return this.faqService.createFaq(createFaqDto);
  }

  @Get()
  findAll() {
    return this.faqService.findAllFaqs();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.faqService.findOneFaq(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateFaqDto: FaqDto) {
    return this.faqService.updateFaq(id, updateFaqDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.faqService.deleteFaq(id);
  }
}
