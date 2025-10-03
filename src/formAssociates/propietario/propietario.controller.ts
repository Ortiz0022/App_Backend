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
import { PropietarioService } from './propietario.service';
import { CreatePropietarioDto } from './dto/create-propietario.dto';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';

@Controller('propietarios')
export class PropietarioController {
  constructor(private readonly propietarioService: PropietarioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPropietarioDto: CreatePropietarioDto) {
    return this.propietarioService.create(createPropietarioDto);
  }

  @Get()
  findAll() {
    return this.propietarioService.findAll();
  }

  @Get('with-fincas-count')
  findAllWithFincasCount() {
    return this.propietarioService.findAllWithFincasCount();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propietarioService.findOne(id);
  }

  @Get('persona/:personaId')
  findByPersonaId(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.propietarioService.findByPersonaId(personaId);
  }

  @Get('cedula/:cedula')
  findByCedula(@Param('cedula') cedula: string) {
    return this.propietarioService.findByCedula(cedula);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropietarioDto: UpdatePropietarioDto,
  ) {
    return this.propietarioService.update(id, updatePropietarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.propietarioService.remove(id);
  }
}