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

@Controller('nucleos-familiares')
export class NucleoFamiliarController {
  constructor(private readonly nucleoFamiliarService: NucleoFamiliarService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNucleoFamiliarDto: CreateNucleoFamiliarDto) {
    return this.nucleoFamiliarService.create(createNucleoFamiliarDto);
  }

  @Get()
  findAll() {
    return this.nucleoFamiliarService.findAll();
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.nucleoFamiliarService.getEstadisticas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.nucleoFamiliarService.findOne(id);
  }

  @Get('asociado/:idAsociado')
  findByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.nucleoFamiliarService.findByAsociado(idAsociado);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNucleoFamiliarDto: UpdateNucleoFamiliarDto,
  ) {
    return this.nucleoFamiliarService.update(id, updateNucleoFamiliarDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.nucleoFamiliarService.remove(id);
  }
}