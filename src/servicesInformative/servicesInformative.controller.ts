import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { ServicesInformativeService } from "./servicesInformative.service";
import { ServicesInformativeDto } from "./dto/ServicesInformativeDto";
import { Roles } from "src/auth/roles.decorator";
import { Public } from "src/auth/public.decorator";

@Controller("servicesInformative")
export class ServicesInformativeController {
  constructor(
    private readonly servicesInformativeService: ServicesInformativeService
  ) {}

  @Post()
  @Roles("ADMIN")
  create(@Body() createServicesInformativeDto: ServicesInformativeDto) {
    return this.servicesInformativeService.create(createServicesInformativeDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.servicesInformativeService.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.servicesInformativeService.findOne(id);
  }

  @Put(":id")
  @Roles("ADMIN")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateServicesInformativeDto: ServicesInformativeDto
  ) {
    return this.servicesInformativeService.update(id, updateServicesInformativeDto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.servicesInformativeService.delete(id);
  }
}