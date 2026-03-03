import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RazonSocialService } from './razon-social.service';
import { UpdateRazonSocialDto } from './dto/update-razon-social.dto';
import { Roles } from 'src/auth/roles.decorator';

@Controller('razones-sociales')
export class RazonSocialController {
  constructor(private readonly razonSocialService: RazonSocialService) {}

  @Get()
  @Roles('ADMIN','JUNTA')
  findAll() {
    return this.razonSocialService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN','JUNTA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.razonSocialService.findOne(id);
  }

  @Get('organizacion/:idOrganizacion')
  @Roles('ADMIN','JUNTA')
  findByOrganizacion(@Param('idOrganizacion', ParseIntPipe) idOrganizacion: number) {
    return this.razonSocialService.findByOrganizacion(idOrganizacion);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRazonSocialDto: UpdateRazonSocialDto,
  ) {
    return this.razonSocialService.update(id, updateRazonSocialDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.razonSocialService.remove(id);
  }
}