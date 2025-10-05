import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { FincaTipoCercaService } from './finca-tipo-cerca.service';
import { CreateFincaTipoCercaDto } from './dto/create-finca-tipo-cerca';


@Controller('finca-tipo-cerca')
export class FincaTipoCercaController {
  constructor(private readonly service: FincaTipoCercaService) {}

  @Post()
  link(@Body() dto: CreateFincaTipoCercaDto) {
    return this.service.link(dto);
  }

  @Get('by-finca/:idFinca')
  listByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.service.listByFinca(idFinca);
  }

  @Delete(':id')
  unlinkById(@Param('id', ParseIntPipe) id: number) {
    return this.service.unlinkById(id);
  }

  @Delete('by-keys/:idFinca/:idTipoCerca')
  unlinkByKeys(
    @Param('idFinca', ParseIntPipe) idFinca: number,
    @Param('idTipoCerca', ParseIntPipe) idTipoCerca: number,
  ) {
    return this.service.unlinkByKeys(idFinca, idTipoCerca);
  }
}
