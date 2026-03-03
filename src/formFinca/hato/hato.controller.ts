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
import { HatoService } from './hato.service';
import { CreateHatoDto } from './dto/create-hato.dto';
import { UpdateHatoDto } from './dto/update-hato.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('hatos')
export class HatoController {
  constructor(private readonly hatoService: HatoService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHatoDto) {
    return this.hatoService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.hatoService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hatoService.findOne(id);
  }

  @Get('finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.hatoService.findByFinca(idFinca);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHatoDto,
  ) {
    return this.hatoService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hatoService.remove(id);
  }
}