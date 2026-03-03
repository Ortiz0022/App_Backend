import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateTipoCercaDto } from './dto/create-tipo-cerca.dto';
import { UpdateTipoCercaDto } from './dto/update-tipo-cerca.dto';
import { TiposCercaService } from './tipo-cerca.service';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('tipos-cerca')
export class TiposCercaController {
  constructor(private readonly service: TiposCercaService) {}

  @Post()
  @Public()
  create(@Body() dto: CreateTipoCercaDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoCercaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
