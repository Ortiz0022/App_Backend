import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FincaOtroEquipoService } from './finca-otro-equipo.service';
import { CreateFincaOtroEquipoDto } from './dto/create-otros-equipos.dto';
import { OTROS_EQUIPOS_VALIDOS } from './dto/otros_equipos_validos';
import { UpdateFincaOtroEquipoDto } from './dto/update-otros-equipos.dto';

@Controller('finca-otro-equipo')
export class FincaOtroEquipoController {
  constructor(private readonly fincaOtroEquipoService: FincaOtroEquipoService) {}

  @Post()
  create(@Body() createDto: CreateFincaOtroEquipoDto) {
    return this.fincaOtroEquipoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.fincaOtroEquipoService.findAll();
  }

  @Get('opciones')
  getOpciones() {
    return { equipos: OTROS_EQUIPOS_VALIDOS };
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca') idFinca: string) {
    return this.fincaOtroEquipoService.findByFinca(+idFinca);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fincaOtroEquipoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFincaOtroEquipoDto,
  ) {
    return this.fincaOtroEquipoService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fincaOtroEquipoService.remove(+id);
  }
}