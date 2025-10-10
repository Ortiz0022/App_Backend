import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { FincaInfraestructurasService } from './fincaInfraestructura.service';
import { CreateFincaInfraestructuraDto } from './dto/create-fincaInfraestructura.dto';


@Controller('finca-infraestructuras')
export class FincaInfraestructurasController {
  constructor(private readonly service: FincaInfraestructurasService) {}

  // Crear enlace finca-infraestructura
  @Post()
  link(@Body() dto: CreateFincaInfraestructuraDto) {
    return this.service.link(dto);
  }

  

  // Listar infraestructuras de una finca
  @Get('by-finca/:idFinca')
  listByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.service.listByFinca(idFinca);
  }

  // Eliminar enlace por id del registro puente
  @Delete(':id')
  unlinkById(@Param('id', ParseIntPipe) id: number) {
    return this.service.unlinkById(id);
  }

  // (Opcional) Eliminar por llaves compuestas
  @Delete('by-keys/:idFinca/:idInfra')
  unlinkByKeys(
    @Param('idFinca', ParseIntPipe) idFinca: number,
    @Param('idInfra', ParseIntPipe) idInfraestructura: number,
  ) {
    return this.service.unlinkByKeys(idFinca, idInfraestructura);
  }
}
