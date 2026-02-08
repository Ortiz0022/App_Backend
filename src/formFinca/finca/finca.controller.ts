import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FincaService } from './finca.service';
import { CreateFincaDto } from './dto/create-finca.dto';
import { UpdateFincaDto } from './dto/update-finca.dto';
import { QueryFincaDto } from './dto/query-finca.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('fincas')
export class FincaController {
  constructor(private readonly fincaService: FincaService) {}

  @Post()
  @Public()
  create(@Body() createFincaDto: CreateFincaDto) {
    return this.fincaService.create(createFincaDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll(@Query() query: QueryFincaDto) {
    return this.fincaService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id') id: string) {
    return this.fincaService.findOne(+id);
  }

  @Get(':id/detallado')
  @Roles('ADMIN','JUNTA')
  findOneDetailed(@Param('id') id: string) {
    return this.fincaService.findOneDetailed(+id);
  }

  @Get(':id/resumen')
  @Roles('ADMIN','JUNTA')
  getSummary(@Param('id') id: string) {
    return this.fincaService.getSummary(+id);
  }

  @Get('asociado/:idAsociado')
  @Roles('ADMIN','JUNTA')
  findByAssociate(@Param('idAsociado') idAsociado: string) {
    return this.fincaService.findByAssociate(+idAsociado);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateFincaDto: UpdateFincaDto) {
    return this.fincaService.update(+id, updateFincaDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.fincaService.remove(+id);
  }
}