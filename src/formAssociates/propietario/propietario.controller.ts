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
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('propietarios')
export class PropietarioController {
  constructor(private readonly propietarioService: PropietarioService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPropietarioDto: CreatePropietarioDto) {
    return this.propietarioService.create(createPropietarioDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.propietarioService.findAll();
  }

  @Get('with-fincas-count')
  @Roles('ADMIN','JUNTA')
  findAllWithFincasCount() {
    return this.propietarioService.findAllWithFincasCount();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propietarioService.findOne(id);
  }

  @Get('persona/:personaId')
  @Roles('ADMIN','JUNTA')
  findByPersonaId(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.propietarioService.findByPersonaId(personaId);
  }

  @Get('cedula/:cedula')
  @Public()
  findByCedula(@Param('cedula') cedula: string) {
    return this.propietarioService.findByCedula(cedula);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropietarioDto: UpdatePropietarioDto,
  ) {
    return this.propietarioService.update(id, updatePropietarioDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.propietarioService.remove(id);
  }
}