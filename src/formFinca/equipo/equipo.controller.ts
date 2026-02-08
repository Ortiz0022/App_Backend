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
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';


@Controller('infraestructura-produccion')
export class InfraestructuraProduccionController {
  constructor(
    private readonly infraestructuraProduccionService: InfraestructuraProduccionService,
  ) {}

  @Post()
  @Public()
  create(@Body() createDto: CreateInfraestructuraProduccionDto) {
    return this.infraestructuraProduccionService.create(createDto);
  }

  @Get('finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  findByFinca(@Param('idFinca') idFinca: string) {
    return this.infraestructuraProduccionService.findByFinca(+idFinca);
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id') id: string) {
    return this.infraestructuraProduccionService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInfraestructuraProduccionDto,
  ) {
    return this.infraestructuraProduccionService.update(+id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.infraestructuraProduccionService.remove(+id);
  }
}