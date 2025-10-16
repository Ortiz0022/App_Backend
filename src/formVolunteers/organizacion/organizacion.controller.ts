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
} from '@nestjs/common';
import { OrganizacionService } from './organizacion.service';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacion.dto';

@Controller('organizaciones')
export class OrganizacionController {
  constructor(private readonly organizacionService: OrganizacionService) {}

  @Get()
  findAll() {
    return this.organizacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.organizacionService.findOne(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.organizacionService.findByEmail(email);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizacionDto: UpdateOrganizacionDto,
  ) {
    return this.organizacionService.update(id, updateOrganizacionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.organizacionService.remove(id);
  }
}