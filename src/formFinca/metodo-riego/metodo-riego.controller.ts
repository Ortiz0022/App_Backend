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

@Controller('metodos-riego')
export class MetodoRiegoController {
  constructor(private readonly metodoRiegoService: MetodoRiegoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateMetodoRiegoDto) {
    return this.metodoRiegoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.metodoRiegoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodoRiegoService.findOne(id);
  }

  @Get('finca/:idFinca')
  findByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.metodoRiegoService.findByFinca(idFinca);
  }

  @Get('finca/:idFinca/count')
  countByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    return this.metodoRiegoService.countByFinca(idFinca);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMetodoRiegoDto,
  ) {
    return this.metodoRiegoService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodoRiegoService.remove(id);
  }
}