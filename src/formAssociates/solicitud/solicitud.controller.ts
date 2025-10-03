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
  import { SolicitudService } from './solicitud.service';
  import { CreateSolicitudDto } from './dto/create-solicitud.dto';
  import { ChangeSolicitudStatusDto } from './dto/change-solicitud-status.dto';
  
  @Controller('solicitudes')
  export class SolicitudController {
    constructor(private readonly solicitudService: SolicitudService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createSolicitudDto: CreateSolicitudDto) {
      return this.solicitudService.create(createSolicitudDto);
    }
  
    @Get()
    findAll() {
      return this.solicitudService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.solicitudService.findOne(id);
    }
  
    @Patch(':id/status')
    changeStatus(
      @Param('id', ParseIntPipe) id: number,
      @Body() changeStatusDto: ChangeSolicitudStatusDto,
    ) {
      return this.solicitudService.changeStatus(id, changeStatusDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.solicitudService.remove(id);
    }
  }