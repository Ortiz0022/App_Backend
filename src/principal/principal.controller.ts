import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PrincipalDto } from './dto/PrincipalDto';
import { PrincipalService } from './principal.service';

@Controller('principal')
export class PrincipalController {

  constructor(private principalService: PrincipalService){}

  @Post()
  create(@Body() createPrincipalDto: PrincipalDto) {
    return this.principalService.createPrincipal(createPrincipalDto);
  }

  @Get()
  findAll() {
    return this.principalService.findAllPrincipal();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.principalService.findOnePrincipal(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateprincipalDto: PrincipalDto) {
    return this.principalService.updatePrincipal(id, updateprincipalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.principalService.deletePrincipal(id);
  }
}

