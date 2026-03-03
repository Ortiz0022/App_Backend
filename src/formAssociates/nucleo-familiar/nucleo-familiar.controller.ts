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
import { NucleoFamiliarService } from './nucleo-familiar.service';
import { CreateNucleoFamiliarDto } from './dto/create-nucleo-familiar.dto';
import { UpdateNucleoFamiliarDto } from './dto/update-nucleo-familiar.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('nucleos-familiares')
export class NucleoFamiliarController {
  constructor(private readonly nucleoFamiliarService: NucleoFamiliarService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNucleoFamiliarDto: CreateNucleoFamiliarDto) {
    return this.nucleoFamiliarService.create(createNucleoFamiliarDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.nucleoFamiliarService.findAll();
  }

  @Get('estadisticas')
  @Roles('ADMIN','JUNTA')
  getEstadisticas() {
    return this.nucleoFamiliarService.getEstadisticas();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.nucleoFamiliarService.findOne(id);
  }

  @Get('asociado/:idAsociado')
  @Roles('ADMIN','JUNTA')
  findByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.nucleoFamiliarService.findByAsociado(idAsociado);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNucleoFamiliarDto: UpdateNucleoFamiliarDto,
  ) {
    return this.nucleoFamiliarService.update(id, updateNucleoFamiliarDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.nucleoFamiliarService.remove(id);
  }
}