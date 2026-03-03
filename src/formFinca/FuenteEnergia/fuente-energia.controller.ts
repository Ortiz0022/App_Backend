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
import { FuenteEnergiaService } from './fuente-energia.service';
import { CreateFuenteEnergiaDto } from './dto/create-fuente-energia.dto';
import { UpdateFuenteEnergiaDto } from './dto/update-fuente-energia.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('fuentes-energia')
export class FuenteEnergiaController {
  constructor(private readonly fuenteEnergiaService: FuenteEnergiaService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateFuenteEnergiaDto) {
    return this.fuenteEnergiaService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.fuenteEnergiaService.findAll();
  }

  @Get('with-fincas-count')
  @Roles('ADMIN','JUNTA')
  findAllWithFincasCount() {
    return this.fuenteEnergiaService.findAllWithFincasCount();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fuenteEnergiaService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFuenteEnergiaDto,
  ) {
    return this.fuenteEnergiaService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fuenteEnergiaService.remove(id);
  }
}