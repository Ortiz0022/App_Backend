import { Body, Controller, Get, Put } from '@nestjs/common';
import { AssociatesPageService } from './associates-page.service';
import { UpsertAssociatesPageDto } from './dto/upsert-associates-page.dto';
import { AssociatesPageResponse } from './dto/associates-page.response';

@Controller('associates-page')
export class AssociatesPageController {
  constructor(private readonly service: AssociatesPageService) {}

  @Get()
  async get(): Promise<AssociatesPageResponse> {
    const page = await this.service.get();
    return {
      id: page.id,
      headerTitle: page.headerTitle,
      headerDescription: page.headerDescription,
      benefits: page.benefits
        .sort((a, b) => a.order - b.order)
        .map((b) => ({ iconName: b.iconName, title: b.title, desc: b.desc, order: b.order })),
      requirements: page.requirements
        .sort((a, b) => a.order - b.order)
        .map((r) => ({ text: r.text, order: r.order })),
    };
  }

  @Put()
  async upsert(@Body() dto: UpsertAssociatesPageDto): Promise<AssociatesPageResponse> {
    const page = await this.service.upsert(dto);
    return {
      id: page.id,
      headerTitle: page.headerTitle,
      headerDescription: page.headerDescription,
      benefits: page.benefits
        .sort((a, b) => a.order - b.order)
        .map((b) => ({ iconName: b.iconName, title: b.title, desc: b.desc, order: b.order })),
      requirements: page.requirements
        .sort((a, b) => a.order - b.order)
        .map((r) => ({ text: r.text, order: r.order })),
    };
  }
}
