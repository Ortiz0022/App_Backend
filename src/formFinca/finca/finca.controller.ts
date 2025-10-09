import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FincaService } from './finca.service';
import { CreateFincaDto } from './dto/create-finca.dto';
import { UpdateFincaDto } from './dto/update-finca.dto';
import { QueryFincaDto } from './dto/query-finca.dto';

@Controller('fincas')
export class FincaController {
  constructor(private readonly fincaService: FincaService) {}

  @Post()
  create(@Body() createFincaDto: CreateFincaDto) {
    return this.fincaService.create(createFincaDto);
  }

  @Get()
  findAll(@Query() query: QueryFincaDto) {
    return this.fincaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fincaService.findOne(+id);
  }

  // ✅ Endpoint para cargar TODO (solo cuando sea necesario)
  @Get(':id/detallado')
  findOneDetailed(@Param('id') id: string) {
    return this.fincaService.findOneDetailed(+id);
  }

  // ✅ Endpoint para resumen optimizado
  @Get(':id/resumen')
  getSummary(@Param('id') id: string) {
    return this.fincaService.getSummary(+id);
  }

  @Get('asociado/:idAsociado')
  findByAssociate(@Param('idAsociado') idAsociado: string) {
    return this.fincaService.findByAssociate(+idAsociado);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFincaDto: UpdateFincaDto) {
    return this.fincaService.update(+id, updateFincaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fincaService.remove(+id);
  }
}