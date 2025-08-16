import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { AboutUsService } from "./aboutUs.service";
import { AboutUs } from "./entities/aboutUs.entity";
import { AboutUsDto } from "./dto/AboutUsDto";
import { AboutUsPatchDto } from "./dto/AboutUsPatchDto";


@Controller('aboutUs')
export class AboutUsController {

    constructor(private aboutUsService: AboutUsService) {}

    @Post()
    create(@Body() createAboutUsDto: AboutUsDto) {
        return this.aboutUsService.create(createAboutUsDto);
    }

    @Get()
    findAll() {
        return this.aboutUsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.aboutUsService.findOne(id);
    }
    
    @Put(':id')
    update(@Param('id') id: number, @Body() updateAboutUsDto: AboutUs) {
        return this.aboutUsService.update(id, updateAboutUsDto);
    }

    @Patch(':id')
    partialUpdate(@Param('id') id: number, @Body() dto: AboutUsPatchDto) {
        return this.aboutUsService.patch(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.aboutUsService.delete(id);
    }   
}