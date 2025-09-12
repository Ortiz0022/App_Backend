import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeSummaryDto } from './dto/home-summary.dto';

@Controller('home')
export class HomeController {
  constructor(private readonly service: HomeService) {}

  /** GET /home/summary */
  @Get('summary')
  getSummary(): Promise<HomeSummaryDto> {
    return this.service.summary();
  }
}
