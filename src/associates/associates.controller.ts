import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { AssociatesService } from './associates.service';
import { CreateAssociateDto } from './dto/create-associate.dto';
import { UpdateAssociateDto } from './dto/update-associate.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QueryAssociateDto } from './dto/query-associate.dto';
import { AssociateStatus } from './dto/associate-status.enum';

// Puedes proteger rutas admin con guards/roles si ya tienes Auth
@Controller('associates')
export class AssociatesController {
  constructor(private readonly service: AssociatesService) {}

  // Público: enviar solicitud (queda PENDIENTE)
  @Post()
  create(@Body() dto: CreateAssociateDto) {
    return this.service.create(dto);
  }

  // Admin: listar (opcionalmente por estado y con búsqueda)
  // /associates?status=APROBADO&search=greilyn
  @Get()
  findAll(@Query() query: QueryAssociateDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Admin: actualizar datos del asociado
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssociateDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.service.changeStatus(id, { estado: AssociateStatus.APROBADO });
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Body() body: { motivo: string }) {
    return this.service.changeStatus(id, { estado: AssociateStatus.RECHAZADO, motivo: body.motivo });
  }


  // Admin: cambiar estado (PENDIENTE/APROBADO/RECHAZADO)
  @Patch(':id/status')
  changeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeStatusDto) {
    return this.service.changeStatus(id, dto);
  }

  // Admin: eliminar registro
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
