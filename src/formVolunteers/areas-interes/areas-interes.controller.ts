import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AreasInteresService } from './areas-interes.service';
import { UpdateAreaInteresDto } from './dto/update-area-interes.dto';

@Controller('areas-interes')
export class AreasInteresController {
  constructor(private readonly areasInteresService: AreasInteresService) {}
//
  @Get()
  findAll() {
    return this.areasInteresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areasInteresService.findOne(id);
  }
//
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAreaInteresDto: UpdateAreaInteresDto,
  ) {
    return this.areasInteresService.update(id, updateAreaInteresDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.areasInteresService.remove(id);
  }
}