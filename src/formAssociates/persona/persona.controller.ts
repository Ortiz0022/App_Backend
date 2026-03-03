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
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';
  
  @Controller('personas')
  export class PersonaController {
    constructor(private readonly personaService: PersonaService) {}
  
    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createPersonaDto: CreatePersonaDto) {
      return this.personaService.create(createPersonaDto);
    }
  
    @Get()
    @Roles('ADMIN','JUNTA')
    findAll() {
      return this.personaService.findAll();
    }
  
    @Get(':id')
    @Roles('ADMIN','JUNTA')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.personaService.findOne(id);
    }
  
    @Get('cedula/:cedula')
    @Public()
  findByCedulaForForms(@Param('cedula') cedula: string): Promise<PersonaFormLookupDto> {
    return this.personaService.findByCedulaForForms(cedula);
  }
  
    @Get('email/:email')
    @Public()
    findByEmail(@Param('email') email: string) {
      return this.personaService.findByEmail(email);
    }
  
    @Patch(':id')
    @Roles('ADMIN')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updatePersonaDto: UpdatePersonaDto,
    ) {
      return this.personaService.update(id, updatePersonaDto);
    }
  
    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.personaService.remove(id);
    }
  }