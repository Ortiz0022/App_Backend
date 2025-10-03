import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
} from '@nestjs/common';
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

  @Get('count/:status')
  countByStatus(@Param('status', ParseBoolPipe) status: boolean) {
    return this.associateService.countByStatus(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.associateService.findOne(id);
  }

  @Get('cedula/:cedula')
  findByCedula(@Param('cedula') cedula: string) {
    return this.associateService.findByCedula(cedula);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssociateDto: UpdateAssociateDto,
  ) {
    return this.associateService.update(id, updateAssociateDto);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.associateService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.associateService.deactivate(id);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.associateService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.associateService.remove(id);
  }
}