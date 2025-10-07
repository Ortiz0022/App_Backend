import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ForrajeService } from './forraje.service';
import { CreateForrajeDto } from './dto/create-forraje.dto';

@Controller('forraje')
export class ForrajeController {
  constructor(private readonly forrajeService: ForrajeService) {}

  @Post()
  create(@Body() createDto: CreateForrajeDto) {
    return this.forrajeService.create(createDto);
  }

  @Get()
  findAll() {
    return this.forrajeService.findAll();
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca') idFinca: string) {
    return this.forrajeService.findByFinca(+idFinca);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forrajeService.findOne(+id);
  }

}