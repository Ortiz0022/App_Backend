import { Body, Controller, Get, Put } from '@nestjs/common';
import { VolunteersPageResponse } from './dto/volunteers-page-response';
import { UpsertVolunteersPageDto } from './dto/upsert-volunteers-page.dto';
import { VolunteersPageService } from './volunteers-page-service';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';


@Controller('volunteers-page')
export class VolunteersPageController {
  constructor(private readonly service: VolunteersPageService) {}

  @Get()
  @Public()
  async get(): Promise<VolunteersPageResponse> {
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
  @Roles('ADMIN')
  async upsert(@Body() dto: UpsertVolunteersPageDto): Promise<VolunteersPageResponse> {
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
