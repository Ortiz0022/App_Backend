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
import { FincaService } from './finca.service';
import { CreateFincaDto } from './dto/create-finca.dto';
import { UpdateFincaDto } from './dto/update-finca.dto';
import { QueryFincaDto } from './dto/query-finca.dto';

@Controller('fincas')
export class FincaController {
  constructor(private readonly service: FincaService) {}

  @Post()
  create(@Body() dto: CreateFincaDto) {
    return this.service.create(dto);
  }

  // Listar todas las fincas (con filtros opcionales)
  // /fincas?idAsociado=5&search=loma
  @Get()
  findAll(@Query() query: QueryFincaDto) {
    return this.service.findAll(query);
  }

  // Obtener todas las fincas de un asociado específico
  // /fincas/associate/5
  @Get('associate/:idAsociado')
  findByAssociate(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.service.findByAssociate(idAsociado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFincaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}