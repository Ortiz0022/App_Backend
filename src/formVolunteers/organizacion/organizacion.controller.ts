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
} from '@nestjs/common';
import { OrganizacionService } from './organizacion.service';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacion.dto';
import { QueryOrganizacionDto } from './dto/query-organizacion.dto';
import { Roles } from 'src/auth/roles.decorator';

@Controller('organizaciones')
export class OrganizacionController {
  constructor(private readonly organizacionService: OrganizacionService) {}

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll(@Query() query: QueryOrganizacionDto) {
    return this.organizacionService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN','JUNTA')
  getStats() {
    return this.organizacionService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.organizacionService.findOne(id);
  }

  @Get('email/:email')
  @Roles('ADMIN','JUNTA')
  findByEmail(@Param('email') email: string) {
    return this.organizacionService.findByEmail(email);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizacionDto: UpdateOrganizacionDto,
  ) {
    return this.organizacionService.update(id, updateOrganizacionDto);
  }

  @Patch(':id/toggle-status')
  @Roles('ADMIN')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.organizacionService.toggleStatus(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.organizacionService.remove(id);
  }
}