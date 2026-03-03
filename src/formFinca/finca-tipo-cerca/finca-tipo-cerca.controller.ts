import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { FincaTipoCercaService } from './finca-tipo-cerca.service';
import { CreateFincaTipoCercaDto } from './dto/create-finca-tipo-cerca';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('finca-tipo-cerca')
export class FincaTipoCercaController {
  constructor(private readonly service: FincaTipoCercaService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  link(@Body() dto: CreateFincaTipoCercaDto) {
    return this.service.link(dto);
  }

  @Get('by-finca/:idFinca')
  @Roles('ADMIN','JUNTA')
  @HttpCode(HttpStatus.OK)
  async listByFinca(@Param('idFinca', ParseIntPipe) idFinca: number) {
    try {
      console.log('🔍 Controller: Buscando tipos de cerca para finca:', idFinca);
      const result = await this.service.listByFinca(idFinca);
      console.log('✅ Controller: Tipos de cerca encontrados:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Controller: Error al buscar tipos de cerca:', error.message);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  unlinkById(@Param('id', ParseIntPipe) id: number) {
    return this.service.unlinkById(id);
  }

  @Delete('by-keys/:idFinca/:idTipoCerca')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  unlinkByKeys(
    @Param('idFinca', ParseIntPipe) idFinca: number,
    @Param('idTipoCerca', ParseIntPipe) idTipoCerca: number,
  ) {
    return this.service.unlinkByKeys(idFinca, idTipoCerca);
  }
}