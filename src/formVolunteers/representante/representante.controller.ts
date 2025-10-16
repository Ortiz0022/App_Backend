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
import { RepresentanteService } from './representante.service';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';

@Controller('representantes')
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Get()
  findAll() {
    return this.representanteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.representanteService.findOne(id);
  }

  @Get('organizacion/:idOrganizacion')
  findByOrganizacion(@Param('idOrganizacion', ParseIntPipe) idOrganizacion: number) {
    return this.representanteService.findByOrganizacion(idOrganizacion);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdateRepresentanteDto,
  ) {
    return this.representanteService.update(id, updateRepresentanteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.representanteService.remove(id);
  }
}