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
import { AnimalService } from './animal.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Controller('animales')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateAnimalDto) {
    return this.animalService.create(createDto);
  }

  @Get()
  findAll() {
    return this.animalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.animalService.findOne(id);
  }

  @Get('hato/:idHato')
  findByHato(@Param('idHato', ParseIntPipe) idHato: number) {
    return this.animalService.findByHato(idHato);
  }

  @Get('hato/:idHato/count')
  countByHato(@Param('idHato', ParseIntPipe) idHato: number) {
    return this.animalService.countByHato(idHato);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAnimalDto,
  ) {
    return this.animalService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.animalService.remove(id);
  }
}