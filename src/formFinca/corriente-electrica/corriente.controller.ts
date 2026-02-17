import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { CreateCorrienteDto } from './dto/create-corriente.dto';
import { UpdateCorrienteDto } from './dto/update-corriente.dto';
import { CorrienteElectricaService } from './corriente.service';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('corriente-electrica')
export class CorrienteElectricaController {
  constructor(private readonly service: CorrienteElectricaService) {}

  @Post()
  @Public()
  create(@Body() dto: CreateCorrienteDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCorrienteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
