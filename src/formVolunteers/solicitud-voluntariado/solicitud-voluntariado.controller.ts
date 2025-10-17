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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SolicitudVoluntariadoService } from './solicitud-voluntariado.service';
import { CreateSolicitudVoluntariadoDto } from './dto/create-solicitud-voluntariado.dto';
import { ChangeSolicitudVoluntariadoStatusDto } from './dto/change-solicitud-voluntariado-status.dto';

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

  // ✅ NUEVO: Endpoint para subir documentos
  @Post(':id/upload-documents')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'cedula', maxCount: 1 },
      { name: 'carta', maxCount: 1 },
    ]),
  )
  async uploadDocuments(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      cedula?: Express.Multer.File[];
      carta?: Express.Multer.File[];
    },
  ) {
    return this.solicitudService.uploadDocuments(id, files);
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