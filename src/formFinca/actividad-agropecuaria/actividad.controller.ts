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
import { CreateActividadDto } from './dto/create-actividad';
import { ActividadesAgropecuariasService } from './actividad.service';
import { UpdateActividadDto } from './dto/update-actividad';


@Controller('actividades-agropecuarias')
export class ActividadesAgropecuariasController {
  constructor(private readonly service: ActividadesAgropecuariasService) {}

  @Post()
  create(@Body() dto: CreateActividadDto) {
    return this.service.create(dto);
  }

  // /actividades-agropecuarias?idFinca=1&search=lecher
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActividadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
