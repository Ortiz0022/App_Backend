import { Controller, Get, Post, Body, Put, Param, Delete, Query, Res } from '@nestjs/common'
import type { Response } from 'express'

import { PersonalService } from './personal.service'
import { PersonalDto } from './dto/PersonalDto'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/auth/roles.decorator'
import { PersonalPdfService } from './pdf.service' // ✅ NUEVO

@Controller('personal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonalController {
  constructor(
    private readonly personalService: PersonalService,
    private readonly personalPdfService: PersonalPdfService, // ✅ NUEVO
  ) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createPersonalDto: PersonalDto) {
    return this.personalService.createPersonal(createPersonalDto)
  }

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.personalService.findAllPersonal()
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id') id: number) {
    return this.personalService.findOnePersonal(id)
  }

  @Put(':id')
  @Roles('ADMIN')
  @Roles('ADMIN')
  update(@Param('id') id: number, @Body() updatePersonalDto: PersonalDto) {
    return this.personalService.updatePersonal(id, updatePersonalDto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @Roles('ADMIN')
  remove(@Param('id') id: number) {
    return this.personalService.deletePersonal(id)
  }

  @Get('pdf/:id')
  @Roles('ADMIN','JUNTA')
  async pdfOne(
    @Res() res: Response, 
    @Param('id') id: string,
  ) {
    const person = await this.personalService.findOnePersonal(+id)

    const buffer = await this.personalPdfService.generatePersonalPDF({ person })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="personal.pdf"')
    res.send(buffer)
  }
}
