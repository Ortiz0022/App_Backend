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

// ✅ Helper: convierte query string a boolean o undefined
// NestJS recibe todos los query params como strings, nunca como booleanos.
// Sin ValidationPipe global, @Transform no se ejecuta, así que lo hacemos aquí.
function parseEstado(value?: string): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === 'true'  || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

@Controller('associates')
export class AssociateController {
  constructor(
    private readonly associateService: AssociateService,
    private readonly associatePdfService: AssociatePdfService,
  ) {}

  @Get()
  @Roles('ADMIN', 'JUNTA')
  findAll(
    @Query('estado') estado?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    // ✅ Construimos el query manualmente con tipos correctos
    const query: QueryAssociateDto = {
      estado: parseEstado(estado),
      search: search || undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sort: sort || undefined,
    };

    return this.associateService.findAll(query);
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

  @Get('pdf-list')
  @Roles('ADMIN', 'JUNTA')
  async pdfList(
    @Res() res: Response,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    const { items } = await this.associateService.findAll({
      page: 1,
      limit: 10_000,
      estado: parseEstado(estado), // ✅ misma función helper
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