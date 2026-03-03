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
import { Roles } from 'src/auth/roles.decorator';

@Controller('areas-interes')
export class AreasInteresController {
  constructor(private readonly areasInteresService: AreasInteresService) {}
//
  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.areasInteresService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areasInteresService.findOne(id);
  }
//
  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAreaInteresDto: UpdateAreaInteresDto,
  ) {
    return this.areasInteresService.update(id, updateAreaInteresDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.areasInteresService.remove(id);
  }
}