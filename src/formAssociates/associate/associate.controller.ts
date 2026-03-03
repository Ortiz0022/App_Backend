import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'

import { AssociateService } from './associate.service'
import { UpdateAssociateDto } from './dto/update-associate.dto'
import { QueryAssociateDto } from './dto/query-associate.dto'
import { AssociatePdfService } from './pdf.service'
import { Roles } from 'src/auth/roles.decorator'
import { Public } from 'src/auth/public.decorator'

@Controller('associates')
export class AssociateController {
  constructor(
    private readonly associateService: AssociateService,
    private readonly associatePdfService: AssociatePdfService,
  ) {}

  @Get()
  @Roles('ADMIN', 'JUNTA')
  findAll(@Query() query: QueryAssociateDto) {
    return this.associateService.findAll(query)
  }

  @Get('active')
  @Roles('ADMIN', 'JUNTA')
  findActive() {
    return this.associateService.findActive()
  }

  @Get('inactive')
  @Roles('ADMIN', 'JUNTA')
  findInactive() {
    return this.associateService.findInactive()
  }

  @Get('stats')
  @Roles('ADMIN', 'JUNTA')
  getStats() {
    return this.associateService.getStats()
  }

  @Get('cedula/:cedula')
  @Public()
  findByCedula(@Param('cedula') cedula: string) {
    return this.associateService.findByCedula(cedula)
  }

  // ============================
  // ✅ PDF LIST (FORZAR DESCARGA)
  // GET /associates/pdf-list?estado=&search=&sort=
  // ============================
  @Get('pdf-list')
  @Roles('ADMIN', 'JUNTA')
  async pdfList(
    @Res() res: Response,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    // estado puede venir "" (vacío), "1"/"0", "true"/"false"
    const estadoTrim = estado?.trim()
    let estadoBool: boolean | undefined = undefined

    if (estadoTrim) {
      const v = estadoTrim.toLowerCase()
      if (v === '1' || v === 'true') estadoBool = true
      else if (v === '0' || v === 'false') estadoBool = false
      else estadoBool = undefined
    }

    // Traer data filtrada para el PDF
    const { items } = await this.associateService.findAll({
      page: 1,
      limit: 10_000, // suficiente para PDF
      estado: estadoBool,
      search: search?.trim() || undefined,
      sort: sort?.trim() || undefined,
    } as QueryAssociateDto)

    const buffer = await this.associatePdfService.generateAssociatesListPDF({
      associates: items ?? [],
      filterText: search?.trim() || undefined,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="asociados.pdf"')
    return res.send(buffer)
  }

  // ✅ NUEVO: Endpoint básico (sin toda la info de fincas)
  @Get(':id/basic')
  @Roles('ADMIN', 'JUNTA')
  findOneBasic(@Param('id') id: string) {
    return this.associateService.findOneBasic(+id)
  }

  @Get(':id')
  @Roles('ADMIN', 'JUNTA')
  findOne(@Param('id') id: string) {
    return this.associateService.findOne(+id)
  }

  @Patch(':id')
  @Roles('ADMIN', 'JUNTA')
  update(@Param('id') id: string, @Body() updateAssociateDto: UpdateAssociateDto) {
    return this.associateService.update(+id, updateAssociateDto)
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(@Param('id') id: string) {
    return this.associateService.activate(+id)
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(@Param('id') id: string) {
    return this.associateService.deactivate(+id)
  }

  @Patch(':id/toggle')
  @Roles('ADMIN')
  toggleStatus(@Param('id') id: string) {
    return this.associateService.toggleStatus(+id)
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.associateService.remove(+id)
  }
}
