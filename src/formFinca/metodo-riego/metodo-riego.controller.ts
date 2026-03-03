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
import { MetodoRiegoService } from './metodo-riego.service';
import { CreateMetodoRiegoDto } from './dto/create-metodo-riego.dto';
import { UpdateMetodoRiegoDto } from './dto/update-metodo-riego.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('metodos-riego')
export class MetodoRiegoController {
  constructor(private readonly metodoRiegoService: MetodoRiegoService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateMetodoRiegoDto) {
    return this.metodoRiegoService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.metodoRiegoService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodoRiegoService.findOne(id);
  }

  @Get('finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.metodoRiegoService.findByFinca(idFinca);
  }

  @Get('finca/:idFinca/count')
  @Roles('ADMIN','JUNTA')
  countByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.metodoRiegoService.countByFinca(idFinca);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMetodoRiegoDto,
  ) {
    return this.metodoRiegoService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodoRiegoService.remove(id);
  }
}