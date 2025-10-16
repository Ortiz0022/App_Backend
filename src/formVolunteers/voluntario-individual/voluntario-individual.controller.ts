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
import { VoluntarioIndividualService } from './voluntario-individual.service';
import { CreateVoluntarioIndividualDto } from './dto/create-voluntario-individual.dto';
import { UpdateVoluntarioIndividualDto } from './dto/update-voluntario-individual.dto';

@Controller('voluntarios-individuales')
export class VoluntarioIndividualController {
  constructor(
    private readonly voluntarioService: VoluntarioIndividualService,
  ) {}

  @Get()
  findAll() {
    return this.voluntarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoluntarioDto: UpdateVoluntarioIndividualDto,
  ) {
    return this.voluntarioService.update(id, updateVoluntarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.remove(id);
  }
}