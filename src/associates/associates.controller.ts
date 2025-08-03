import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { AssociateDto } from './dto/AssociatesDto';
import { AssociateService } from './associates.service';

@Controller('associate')
export class AssociateController {

  constructor(private associateService: AssociateService){}

  @Post()
  create(@Body() createAssociateDto: AssociateDto) {
    return this.associateService.createAssociate(createAssociateDto);
  }

  @Get()
  findAll() {
    return this.associateService.findAllAssociates();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.associateService.findOneAssociate(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateAssociateDto: AssociateDto) {
    return this.associateService.updateAssociate(id, updateAssociateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.associateService.deleteAssociate(id);
  }
}

