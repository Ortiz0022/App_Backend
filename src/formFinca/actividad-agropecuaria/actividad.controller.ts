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
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';


@Controller('actividades-agropecuarias')
export class ActividadesAgropecuariasController {
  constructor(private readonly service: ActividadesAgropecuariasService) {}

  @Post()
  @Public()
  create(@Body() dto: CreateActividadDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll(@Query('idFinca') idFinca?: string, @Query('search') search?: string) {
    const parsed = idFinca ? Number(idFinca) : undefined;
    return this.service.findAll({ idFinca: parsed, search });
  }

  @Get('by-finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  listByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.service.listByFinca(idFinca);
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActividadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
