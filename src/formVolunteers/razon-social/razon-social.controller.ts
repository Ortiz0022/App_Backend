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

@Controller('razones-sociales')
export class RazonSocialController {
  constructor(private readonly razonSocialService: RazonSocialService) {}

  @Get()
  findAll() {
    return this.razonSocialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.razonSocialService.findOne(id);
  }

  @Get('organizacion/:idOrganizacion')
  findByOrganizacion(@Param('idOrganizacion', ParseIntPipe) idOrganizacion: number) {
    return this.razonSocialService.findByOrganizacion(idOrganizacion);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRazonSocialDto: UpdateRazonSocialDto,
  ) {
    return this.razonSocialService.update(id, updateRazonSocialDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.razonSocialService.remove(id);
  }
}