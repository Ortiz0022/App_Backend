import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ForrajeService } from './forraje.service';
import { CreateForrajeDto } from './dto/create-forraje.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('forraje')
export class ForrajeController {
  constructor(private readonly forrajeService: ForrajeService) {}

  @Post()
  @Public()
  create(@Body() createDto: CreateForrajeDto) {
    return this.forrajeService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.forrajeService.findAll();
  }

  @Get('finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  findByFinca(@Param('idFinca') idFinca: string) {
    return this.forrajeService.findByFinca(+idFinca);
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id') id: string) {
    return this.forrajeService.findOne(+id);
  }

}