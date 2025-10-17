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
import { SolicitudVoluntariadoService } from './solicitud-voluntariado.service';
import { CreateSolicitudVoluntariadoDto } from './dto/create-solicitud-voluntariado.dto';
import { ChangeSolicitudVoluntariadoStatusDto } from './dto/change-solicitud-voluntariado-status.dto';
import { SolicitudVoluntariadoStatus } from './dto/solicitud-voluntariado-status.enum';

@Controller('solicitudes-voluntariado')
export class SolicitudVoluntariadoController {
  constructor(
    private readonly solicitudService: SolicitudVoluntariadoService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSolicitudDto: CreateSolicitudVoluntariadoDto) {
    return this.solicitudService.create(createSolicitudDto);
  }

  @Get()
    findAll(
      @Query('estado') estado?: SolicitudVoluntariadoStatus,
      @Query('search') search?: string,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('sort') sort?: string,
    ) {
      return this.solicitudService.findAllPaginated({
        estado,
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        sort,
      });
    }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeSolicitudVoluntariadoStatusDto,
  ) {
    return this.solicitudService.changeStatus(id, changeStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.remove(id);
  }
}