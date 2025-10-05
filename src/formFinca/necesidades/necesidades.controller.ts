import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NecesidadesService } from './necesidades.service';
import { CreateNecesidadesDto } from './dto/create-necesidades.dto';
import { UpdateNecesidadesDto } from './dto/update-necesidades.dto';

@Controller('necesidades')
export class NecesidadesController {
  constructor(private readonly necesidadesService: NecesidadesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateNecesidadesDto) {
    return this.necesidadesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.necesidadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.necesidadesService.findOne(id);
  }

  @Get('asociado/:idAsociado')
  findByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.necesidadesService.findByAsociado(idAsociado);
  }

  @Get('asociado/:idAsociado/count')
  countByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.necesidadesService.countByAsociado(idAsociado);
  }

  @Post('asociado/:idAsociado/reorder')
  @HttpCode(HttpStatus.OK)
  reorderByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.necesidadesService.reorderByAsociado(idAsociado);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNecesidadesDto,
  ) {
    return this.necesidadesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.necesidadesService.remove(id);
  }
}