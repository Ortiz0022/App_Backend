import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GeografiaService } from './geografia.service';
import { CreateGeografiaDto } from './dto/create-geografia.dto';
import { UpdateGeografiaDto } from './dto/update-geografia.dto';

@Controller('geografias')
export class GeografiaController {
  constructor(private readonly geografiaService: GeografiaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateGeografiaDto) {
    return this.geografiaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.geografiaService.findAll();
  }

  @Get('with-fincas-count')
  findAllWithFincasCount() {
    return this.geografiaService.findAllWithFincasCount();
  }

  @Get('provincias')
  getProvincias() {
    return this.geografiaService.getProvincias();
  }

  @Get('cantones')
  getCantonesByProvincia(@Query('provincia') provincia: string) {
    return this.geografiaService.getCantonesByProvincia(provincia);
  }

  @Get('distritos')
  getDistritosByCanton(
    @Query('provincia') provincia: string,
    @Query('canton') canton: string,
  ) {
    return this.geografiaService.getDistritosByCanton(provincia, canton);
  }

  @Get('provincia/:provincia')
  findByProvincia(@Param('provincia') provincia: string) {
    return this.geografiaService.findByProvincia(provincia);
  }

  @Get('canton/:provincia/:canton')
  findByCanton(
    @Param('provincia') provincia: string,
    @Param('canton') canton: string,
  ) {
    return this.geografiaService.findByCanton(provincia, canton);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGeografiaDto,
  ) {
    return this.geografiaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.remove(id);
  }
}