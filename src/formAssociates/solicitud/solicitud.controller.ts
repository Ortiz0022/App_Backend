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
  UseInterceptors,
  UploadedFiles,
  Res} from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { ChangeSolicitudStatusDto } from './dto/change-solicitud-status.dto';
import { SolicitudStatus } from './dto/solicitud-status.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import express from 'express';
import { PdfService } from './pdf.service';

@Controller('solicitudes')
export class SolicitudController {
  constructor(
    private readonly solicitudService: SolicitudService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSolicitudDto: CreateSolicitudDto) {
    return this.solicitudService.create(createSolicitudDto);
  }

  @Post(':id/upload-documents')
  @UseInterceptors(
  FileFieldsInterceptor([
    { name: 'cedula', maxCount: 1 },
    { name: 'planoFinca', maxCount: 1 },
  ]),
)
  async uploadDocuments(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      cedula?: Express.Multer.File[]; 
      planoFinca?: Express.Multer.File[]; 
    },
  ) {
    return this.solicitudService.uploadDocuments(id, files);
  }

  @Get()
  findAll(
    @Query('estado') estado?: SolicitudStatus,
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

  @Get('stats')
  getStats() {
    return this.solicitudService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  @Get(':id/complete')
  findOneComplete(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOneComplete(id);
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

  @Get(':id/pdf')
  async downloadPDF(
    @Param('id') id: string,
    @Res() res: express.Response,
  ): Promise<void> {
    const solicitud = await this.solicitudService.findOneComplete(+id);
    
    const pdfBuffer = await this.pdfService.generateSolicitudPDF(solicitud);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=solicitud-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  }
}