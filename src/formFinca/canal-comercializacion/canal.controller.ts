import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateCanalDto } from './dto/create-canal';
import { CanalesComercializacionService } from './canal.service';
import { UpdateCanalDto } from './dto/update-canal';


@Controller('canales-comercializacion')
export class CanalesComercializacionController {
  constructor(private readonly service: CanalesComercializacionService) {}

  @Post()
  create(@Body() dto: CreateCanalDto) {
    return this.service.create(dto);
  }

  // /canales-comercializacion?idFinca=1&search=cooperativa
  @Get()
  findAll(@Query('idFinca') idFinca?: string, @Query('search') search?: string) {
    const parsed = idFinca ? Number(idFinca) : undefined;
    return this.service.findAll({ idFinca: parsed, search });
  }

  @Get('by-finca/:idFinca')
  listByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.service.listByFinca(idFinca);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCanalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
