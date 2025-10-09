import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AssociateService } from './associate.service';
import { UpdateAssociateDto } from './dto/update-associate.dto';
import { QueryAssociateDto } from './dto/query-associate.dto';

@Controller('associates')
export class AssociateController {
  constructor(private readonly associateService: AssociateService) {}

  @Get()
  findAll(@Query() query: QueryAssociateDto) {
    return this.associateService.findAll(query);
  }

  @Get('active')
  findActive() {
    return this.associateService.findActive();
  }

  @Get('inactive')
  findInactive() {
    return this.associateService.findInactive();
  }

  @Get('stats')
  getStats() {
    return this.associateService.getStats();
  }

  @Get('cedula/:cedula')
  findByCedula(@Param('cedula') cedula: string) {
    return this.associateService.findByCedula(cedula);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.associateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssociateDto: UpdateAssociateDto) {
    return this.associateService.update(+id, updateAssociateDto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.associateService.activate(+id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.associateService.deactivate(+id);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string) {
    return this.associateService.toggleStatus(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.associateService.remove(+id);
  }
}