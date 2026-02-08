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
import { NecesidadesService } from './necesidades.service';
import { CreateNecesidadesDto } from './dto/create-necesidades.dto';
import { UpdateNecesidadesDto } from './dto/update-necesidades.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('necesidades')
export class NecesidadesController {
  constructor(private readonly necesidadesService: NecesidadesService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateNecesidadesDto) {
    return this.necesidadesService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.necesidadesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.necesidadesService.findOne(id);
  }

  @Get('asociado/:idAsociado')
  @Roles('ADMIN','JUNTA')
  findByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.necesidadesService.findByAsociado(idAsociado);
  }

  @Get('asociado/:idAsociado/count')
  @Roles('ADMIN','JUNTA')
  countByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.necesidadesService.countByAsociado(idAsociado);
  }

  @Post('asociado/:idAsociado/reorder')
  @Roles('ADMIN','JUNTA')
  @HttpCode(HttpStatus.OK)
  reorderByAsociado(@Param('idAsociado', ParseIntPipe) idAsociado: number) {
    return this.necesidadesService.reorderByAsociado(idAsociado);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNecesidadesDto,
  ) {
    return this.necesidadesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.necesidadesService.remove(id);
  }
}