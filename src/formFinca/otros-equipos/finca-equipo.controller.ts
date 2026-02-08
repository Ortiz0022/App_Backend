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
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('finca-otro-equipo')
export class FincaOtroEquipoController {
  constructor(private readonly fincaOtroEquipoService: FincaOtroEquipoService) {}

  @Post()
  @Public()
  create(@Body() createDto: CreateFincaOtroEquipoDto) {
    return this.fincaOtroEquipoService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.fincaOtroEquipoService.findAll();
  }

  @Get('opciones')
  @Roles('ADMIN','JUNTA')
  getOpciones() {
    return { equipos: OTROS_EQUIPOS_VALIDOS };
  }

  @Get('finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  findByFinca(@Param('idFinca') idFinca: string) {
    return this.fincaOtroEquipoService.findByFinca(+idFinca);
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id') id: string) {
    return this.fincaOtroEquipoService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFincaOtroEquipoDto,
  ) {
    return this.fincaOtroEquipoService.update(+id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.fincaOtroEquipoService.remove(+id);
  }
}