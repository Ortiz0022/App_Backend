// ========================================
// solicitud-voluntariado.controller.ts
// ========================================
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
  StreamableFile,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { SolicitudVoluntariadoService } from './solicitud-voluntariado.service';
import { CreateSolicitudVoluntariadoDto } from './dto/create-solicitud-voluntariado.dto';
import { ChangeSolicitudVoluntariadoStatusDto } from './dto/change-solicitud-voluntariado-status.dto';
import { SolicitudVoluntariadoStatus } from './dto/solicitud-voluntariado-status.enum';

// ✅ PDF de detalle (individual/organización)
import { VoluntarioPdfService } from './solicitud-individual.pdf.service';
// ✅ PDF listado de solicitudes (el que querés ahora)
import { SolicitudesVoluntariadoPdfService } from './solicitudes.pdf.service';
import { VoluntariosListadoPdfService } from './voluntariado.pdf.service';

@Controller('solicitud-voluntariado') // ✅ para que sea /solicitud-voluntariado/...
export class SolicitudVoluntariadoController {
  constructor(
    private readonly solicitudService: SolicitudVoluntariadoService,
    private readonly voluntarioPdfService: VoluntarioPdfService,
    private readonly solicitudesPdfService: SolicitudesVoluntariadoPdfService,
        private readonly voluntariosListadoPdfService: VoluntariosListadoPdfService, 
  ) {}

  // ==========================
  // CRUD normal
  // ==========================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSolicitudDto: CreateSolicitudVoluntariadoDto) {
    return this.solicitudService.create(createSolicitudDto);
  }

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
      cv?: any[];
      cedula?: any[];
      carta?: any[];
    },
  ) {
    return this.solicitudService.uploadDocuments(id, files);
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
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sort,
    });
  }

  // ==========================
  // ✅ PDF LISTADO (EL QUE PEDISTE)
  // GET /solicitud-voluntariado/pdf-solicitudes
  // ==========================
  @Get('pdf-solicitudes') // ✅ ojo: esto va ANTES de @Get(':id')
  async pdfSolicitudes(): Promise<StreamableFile> {
    // 1) Traer todo (simple)
    const solicitudes = await this.solicitudService.findAll();

    // 2) Mapear a rows (solo lo necesario)
    const rows = (solicitudes ?? []).map((s: any) => {
      const tipo = String(s?.tipoSolicitante ?? '').toUpperCase();
      const isInd = tipo === 'INDIVIDUAL';

      const persona = s?.voluntario?.persona;
      const org = s?.organizacion;

      const solicitante = isInd
        ? `${persona?.nombre ?? ''} ${persona?.apellido1 ?? ''} ${persona?.apellido2 ?? ''}`.trim() || '—'
        : (org?.nombre ?? '—');

      const identificacion = isInd ? (persona?.cedula ?? '—') : (org?.cedulaJuridica ?? '—');
      const email = isInd ? (persona?.email ?? '—') : (org?.email ?? '—');

      return {
        tipoSolicitante: s?.tipoSolicitante ?? '—',
        solicitante,
        identificacion,
        email,
        estado: s?.estado ?? '—',
        fecha: s?.fechaSolicitud ?? s?.createdAt ?? null,
      };
    });

    // 3) Generar PDF (ESTE método es del servicio de listado)
    const pdfBuffer = await this.solicitudesPdfService.generateListadoSolicitudesPDF({
      titulo: 'Solicitudes de Voluntarios',
      tabActiva: 'PENDIENTES', // fijo (si luego querés, lo hacemos configurable)
      filtro: 'PENDIENTE',
      estadoCard: 'PENDIENTE',
      rows,
    });

    // 4) Retornar PDF sin @Res() ni setHeader()
    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: 'inline; filename="solicitudes-de-voluntarios.pdf"',
    });
  }

@Get('pdf-voluntarios')
async pdfVoluntarios(): Promise<StreamableFile> {
  const solicitudes = await this.solicitudService.findAll();

  const toActivoInactivo = (v: any): 'ACTIVO' | 'INACTIVO' | '—' => {
    if (v === true) return 'ACTIVO'
    if (v === false) return 'INACTIVO'
    if (v === null || v === undefined) return '—'

    const s = String(v).trim().toUpperCase()
    if (['ACTIVO', 'ACTIVE', '1', 'TRUE', 'SI', 'SÍ'].includes(s)) return 'ACTIVO'
    if (['INACTIVO', 'INACTIVE', '0', 'FALSE', 'NO'].includes(s)) return 'INACTIVO'
    return '—'
  }

  const pickFirst = (...vals: any[]) => {
    for (const v of vals) if (v !== null && v !== undefined && String(v).trim() !== '') return v
    return undefined
  }

  const rows = (solicitudes ?? []).map((s: any) => {
    const tipoRaw = String(s?.tipoSolicitante ?? '').toUpperCase()
    const isInd = tipoRaw === 'INDIVIDUAL'

    const voluntario = s?.voluntario
    const persona = s?.voluntario?.persona
    const org = s?.organizacion

    const tipo = isInd ? 'INDIVIDUAL' : 'ORGANIZACION'
    const identificacion = isInd ? (persona?.cedula ?? '—') : (org?.cedulaJuridica ?? '—')

    const nombre = isInd
      ? `${persona?.nombre ?? ''} ${persona?.apellido1 ?? ''} ${persona?.apellido2 ?? ''}`.trim() || '—'
      : (org?.nombre ?? '—')

    const telefono = isInd ? (persona?.telefono ?? '—') : (org?.telefono ?? '—')
    const email = isInd ? (persona?.email ?? '—') : (org?.email ?? '—')

    // ✅ “Llamar” el estado: probamos TODOS los sitios comunes
    const rawEstado = pickFirst(
      // voluntario
      voluntario?.activo, voluntario?.isActive, voluntario?.estado, voluntario?.status,
      // persona
      persona?.activo, persona?.isActive, persona?.estado, persona?.status,
      // organizacion
      org?.activo, org?.isActive, org?.estado, org?.status,
      // solicitud (por si el estado está ahí)
      s?.activo, s?.isActive, s?.estado, s?.status,
    )

    const estado = toActivoInactivo(rawEstado)

    return { tipo, identificacion, nombre, telefono, email, estado }
  })

  // opcional: eliminar duplicados por identificación
  const unique: any[] = []
  const seen = new Set<string>()
  for (const r of rows) {
    const key = String(r.identificacion ?? '').trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(r)
  }

  const pdfBuffer = await this.voluntariosListadoPdfService.generateVoluntariosListadoPDF({
    titulo: 'Listado de Voluntarios',
    rows: unique,
  })

  return new StreamableFile(pdfBuffer, {
    type: 'application/pdf',
    disposition: 'inline; filename="listado-voluntarios.pdf"',
  })
}


  // ==========================
  // Detalle de una solicitud
  // ==========================
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  // ==========================
  // ✅ PDF DETALLE (si lo ocupás)
  // GET /solicitud-voluntariado/:id/pdf
  // ==========================
  @Get(':id/pdf')
  async pdfDetalle(@Param('id', ParseIntPipe) id: number): Promise<StreamableFile> {
    const solicitud = await this.solicitudService.findOne(id);

    let pdfBuffer: Buffer;
    let filename = `solicitud-${id}.pdf`;

    if (String(solicitud?.tipoSolicitante).toUpperCase() === 'INDIVIDUAL' && solicitud?.voluntario) {
      pdfBuffer = await this.voluntarioPdfService.generateVoluntarioIndividualPDF(solicitud.voluntario);
      filename = `voluntario-individual-${solicitud.voluntario?.persona?.cedula ?? id}.pdf`;
    } else if (String(solicitud?.tipoSolicitante).toUpperCase() === 'ORGANIZACION' && solicitud?.organizacion) {
      pdfBuffer = await this.voluntarioPdfService.generateOrganizacionPDF(solicitud.organizacion);
      filename = `organizacion-${solicitud.organizacion?.cedulaJuridica ?? id}.pdf`;
    } else {
      // si está mal relacionada la solicitud
      pdfBuffer = Buffer.from('');
    }

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `inline; filename="${filename}"`,
    });
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
