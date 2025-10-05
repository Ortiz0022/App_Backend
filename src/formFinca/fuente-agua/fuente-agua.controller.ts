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
import { CreateFuenteAguaDto } from './dto/create-fuente-agua';
import { FuentesAguaService } from './fuente-agua.service';
import { UpdateFuenteAguaDto } from './dto/update-fuente-agua';


@Controller('fuentes-agua')
export class FuentesAguaController {
  constructor(private readonly service: FuentesAguaService) {}

  @Post()
  create(@Body() dto: CreateFuenteAguaDto) {
    return this.service.create(dto);
  }

  // /fuentes-agua?idFinca=1&search=pozo
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFuenteAguaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
