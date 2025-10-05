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
import { AccesoService } from './acceso.service';
import { CreateAccesoDto } from './dto/create-acceso.dto';
import { UpdateAccesoDto } from './dto/update-acceso.dto';

@Controller('accesos')
export class AccesoController {
  constructor(private readonly accesoService: AccesoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateAccesoDto) {
    return this.accesoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.accesoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accesoService.findOne(id);
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.accesoService.findByFinca(idFinca);
  }

  @Get('finca/:idFinca/count')
  countByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.accesoService.countByFinca(idFinca);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAccesoDto,
  ) {
    return this.accesoService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accesoService.remove(id);
  }
}