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
  import { PersonaService } from './persona.service';
  import { CreatePersonaDto } from './dto/create-persona.dto';
  import { UpdatePersonaDto } from './dto/update-persona.dto';
import { PersonaFormLookupDto } from './dto/persona-form-lookup.dto';
  
  @Controller('personas')
  export class PersonaController {
    constructor(private readonly personaService: PersonaService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createPersonaDto: CreatePersonaDto) {
      return this.personaService.create(createPersonaDto);
    }
  
    @Get()
    findAll() {
      return this.personaService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.personaService.findOne(id);
    }
  
    @Get('cedula/:cedula')
  findByCedulaForForms(@Param('cedula') cedula: string): Promise<PersonaFormLookupDto> {
    return this.personaService.findByCedulaForForms(cedula);
  }
  
    @Get('email/:email')
    findByEmail(@Param('email') email: string) {
      return this.personaService.findByEmail(email);
    }
  
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updatePersonaDto: UpdatePersonaDto,
    ) {
      return this.personaService.update(id, updatePersonaDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.personaService.remove(id);
    }
  }