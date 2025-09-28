import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociatesPage } from './entities/associates-page.entity';
import { Benefit } from './entities/benefit.entity';
import { Requirement } from './entities/requirement.entity';
import { AssociatesPageService } from './associates-page.service';
import { AssociatesPageController } from './associates-page.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AssociatesPage, Benefit, Requirement])],
  providers: [AssociatesPageService],
  controllers: [AssociatesPageController],
  exports: [AssociatesPageService],
})
export class AssociatesPageModule implements OnModuleInit {
  constructor(private readonly service: AssociatesPageService) {}
  async onModuleInit() {
    await this.service.seedIfEmpty();
  }
}
