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
import { Roles } from 'src/auth/roles.decorator';
import { Public } from 'src/auth/public.decorator';

@Controller('representantes')
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}
  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.representanteService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.representanteService.findOne(id);
  }

  @Get('organizacion/:idOrganizacion')
  @Roles('ADMIN','JUNTA')
  findByOrganizacion(@Param('idOrganizacion', ParseIntPipe) idOrganizacion: number) {
    return this.representanteService.findByOrganizacion(idOrganizacion);
  }

   @Get("validate-cedula/:cedula")
   @Public()
  validateCedula(@Param("cedula") cedula: string) {
    return this.representanteService.validatePersonaDisponibleParaRepresentante(cedula);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdateRepresentanteDto,
  ) {
    return this.representanteService.update(id, updateRepresentanteDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.representanteService.remove(id);
  }
}