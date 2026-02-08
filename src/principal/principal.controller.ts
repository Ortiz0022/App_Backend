import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PrincipalDto } from './dto/PrincipalDto';
import { PrincipalService } from './principal.service';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';

@Controller('principal')
export class PrincipalController {
  constructor(private principalService: PrincipalService){}
  @Post()
  @Roles('ADMIN')
  create(@Body() createPrincipalDto: PrincipalDto) {
    return this.principalService.createPrincipal(createPrincipalDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.principalService.findAllPrincipal();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.principalService.findOnePrincipal(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: number, @Body() updateprincipalDto: PrincipalDto) {
    return this.principalService.updatePrincipal(id, updateprincipalDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: number) {
    return this.principalService.deletePrincipal(id);
  }
}

