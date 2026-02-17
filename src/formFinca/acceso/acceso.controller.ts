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
import { AccesoService } from './acceso.service';
import { CreateAccesoDto } from './dto/create-acceso.dto';
import { UpdateAccesoDto } from './dto/update-acceso.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('accesos')
export class AccesoController {
  constructor(private readonly accesoService: AccesoService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateAccesoDto) {
    return this.accesoService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.accesoService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accesoService.findOne(id);
  }

  @Get('finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.accesoService.findByFinca(idFinca);
  }

  @Get('finca/:idFinca/count')
  @Roles('ADMIN','JUNTA')
  countByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.accesoService.countByFinca(idFinca);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAccesoDto,
  ) {
    return this.accesoService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accesoService.remove(id);
  }
}