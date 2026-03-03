import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateInfraestructuraDto } from './dto/create-infraestructura.dto';
import { UpdateInfraestructuraDto } from './dto/update-infraestructura.dto';
import { InfraestructurasService } from './infraestructura.service';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('infraestructuras')
export class InfraestructurasController {
  constructor(private readonly service: InfraestructurasService) {}

  @Post()
  @Public()
  create(@Body() dto: CreateInfraestructuraDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInfraestructuraDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
