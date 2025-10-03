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
  import { AssociateService } from './associate.service';
  import { CreateAssociateDto } from './dto/create-associate.dto';
  import { UpdateAssociateDto } from './dto/update-associate.dto';
  import { ChangeStatusDto } from './dto/change-status.dto';
  import { QueryAssociateDto } from './dto/query-associate.dto';
  import { AssociateStatus } from './dto/associate-status.enum';
  
  @Controller('associates')
  export class AssociateController {
    constructor(private readonly associateService: AssociateService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createAssociateDto: CreateAssociateDto) {
      return this.associateService.create(createAssociateDto);
    }
  
    @Get()
    findAll(@Query() query: QueryAssociateDto) {
      return this.associateService.findAll(query);
    }
  
    @Get('stats')
    getStats() {
      return this.associateService.getStatsByStatus();
    }
  
    @Get('count/:status')
    countByStatus(@Param('status') status: AssociateStatus) {
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
  
    @Patch(':id/status')
    changeStatus(
      @Param('id', ParseIntPipe) id: number,
      @Body() changeStatusDto: ChangeStatusDto,
    ) {
      return this.associateService.changeStatus(id, changeStatusDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.associateService.remove(id);
    }
  }