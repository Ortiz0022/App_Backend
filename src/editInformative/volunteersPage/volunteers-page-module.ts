import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteersPage } from './entities/volunteers-page.entity';
import { VolunteersPageService } from './volunteers-page-service';
import { VolunteersPageController } from './volunteers-page-controller';
import { Benefit } from './entities/benefit.entity';
import { Requirement } from './entities/requirement.entity';


@Module({
  imports: [TypeOrmModule.forFeature([VolunteersPage, Benefit, Requirement])],
  providers: [VolunteersPageService],
  controllers: [VolunteersPageController],
  exports: [VolunteersPageService],
})
export class VolunteersPageModule implements OnModuleInit {
  constructor(private readonly service: VolunteersPageService) {}
  async onModuleInit() {
    await this.service.seedIfEmpty();
  }
}
