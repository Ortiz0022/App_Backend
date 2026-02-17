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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SolicitudService } from './solicitud.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { ChangeSolicitudStatusDto } from './dto/change-solicitud-status.dto';
import { SolicitudStatus } from './dto/solicitud-status.enum';
import { ValidateSolicitudDto } from './dto/validate-solicitud.dto';
import { PdfService } from './reports/solicitudPdf.service';
import { SolicitudesListPdfService } from './reports/solicitudesPdf.service';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('solicitudes')
export class SolicitudController {
  constructor(
    private readonly solicitudService: SolicitudService,
    private readonly pdfService: PdfService,
    private readonly solicitudesListPdfService: SolicitudesListPdfService,
  ) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSolicitudDto: CreateSolicitudDto) {
    return this.solicitudService.create(createSolicitudDto);
  }

  @Post(':id/upload-documents')
  @Public()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cedula', maxCount: 1 },
      { name: 'planoFinca', maxCount: 1 },
    ]),
  )
  async uploadDocuments(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: { cedula?: any[]; planoFinca?: any[] },
  ) {
    return this.solicitudService.uploadDocuments(id, files);
  }

    @Post('validate')
    @Public()
  validateBeforeCreate(@Body() dto: ValidateSolicitudDto) {
    return this.solicitudService.validateBeforeCreate(dto);
  }

  @Get()
  @Roles('ADMIN','JUNTA')
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
  @Roles('ADMIN','JUNTA')
  getStats() {
    return this.solicitudService.getStats();
  }

@Get('pdf-list')
@Roles('ADMIN','JUNTA')
async downloadSolicitudesListPDF(
  @Query('estado') estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO',
  @Query('search') search: string,
  @Query('sort') sort: string,
  @Res() res: Response,
): Promise<void> {
    const result = await this.solicitudService.findAllPaginated({
      estado,
      search,
      page: 1,
      limit: 10000,
      sort,
    });

    const filterParts: string[] = [];
    if (estado) filterParts.push(`Estado: ${estado}`);
    if (search?.trim()) filterParts.push(`Búsqueda: ${search.trim()}`);
    if (sort?.trim()) filterParts.push(`Orden: ${sort.trim()}`);
    const filterText = filterParts.join(' · ');

    const pdfBuffer = await this.solicitudesListPdfService.generateSolicitudesListPDF({
      solicitudes: result.items,
      filterText,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="solicitudes.pdf"');
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.setHeader('Cache-Control', 'no-store');

    res.end(pdfBuffer);
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  @Get(':id/complete')
  @Roles('ADMIN','JUNTA')
  findOneComplete(@Param('id') id: string) {
    return this.solicitudService.findOneComplete(+id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeSolicitudStatusDto,
  ) {
    return this.solicitudService.changeStatus(id, changeStatusDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.remove(id);
  }

  @Get(':id/pdf')
  @Roles('ADMIN','JUNTA')
  async downloadPDF(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const solicitud = await this.solicitudService.findOneComplete(id);

    const pdfBuffer = await this.pdfService.generateSolicitudPDF(solicitud);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="solicitud-${id}.pdf"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.setHeader('Cache-Control', 'no-store');

    res.end(pdfBuffer);
  }
}
