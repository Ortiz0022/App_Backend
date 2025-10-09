import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InfraestructuraProduccionService } from './equipo.service';
import { CreateInfraestructuraProduccionDto } from './dto/create-equipo.dto';
import { UpdateInfraestructuraProduccionDto } from './dto/update-equipo.dto';


@Controller('infraestructura-produccion')
export class InfraestructuraProduccionController {
  constructor(
    private readonly infraestructuraProduccionService: InfraestructuraProduccionService,
  ) {}

  @Post()
  create(@Body() createDto: CreateInfraestructuraProduccionDto) {
    return this.infraestructuraProduccionService.create(createDto);
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca') idFinca: string) {
    return this.infraestructuraProduccionService.findByFinca(+idFinca);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.infraestructuraProduccionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInfraestructuraProduccionDto,
  ) {
    return this.infraestructuraProduccionService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.infraestructuraProduccionService.remove(+id);
  }
}