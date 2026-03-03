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
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('geografias')
export class GeografiaController {
  constructor(private readonly geografiaService: GeografiaService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateGeografiaDto) {
    return this.geografiaService.create(createDto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.geografiaService.findAll();
  }

  @Get('with-fincas-count')
  @Roles('ADMIN','JUNTA')
  findAllWithFincasCount() {
    return this.geografiaService.findAllWithFincasCount();
  }

  @Get('provincias')
  @Roles('ADMIN','JUNTA')
  getProvincias() {
    return this.geografiaService.getProvincias();
  }

  @Get('cantones')
  @Roles('ADMIN','JUNTA')
  getCantonesByProvincia(@Query('provincia') provincia: string) {
    return this.geografiaService.getCantonesByProvincia(provincia);
  }

  @Get('distritos')
  @Roles('ADMIN','JUNTA')
  getDistritosByCanton(
    @Query('provincia') provincia: string,
    @Query('canton') canton: string,
  ) {
    return this.geografiaService.getDistritosByCanton(provincia, canton);
  }

  @Get('provincia/:provincia')
  @Roles('ADMIN','JUNTA')
  findByProvincia(@Param('provincia') provincia: string) {
    return this.geografiaService.findByProvincia(provincia);
  }

  @Get('canton/:provincia/:canton')
  @Roles('ADMIN','JUNTA')
  findByCanton(
    @Param('provincia') provincia: string,
    @Param('canton') canton: string,
  ) {
    return this.geografiaService.findByCanton(provincia, canton);
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGeografiaDto,
  ) {
    return this.geografiaService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.remove(id);
  }
}