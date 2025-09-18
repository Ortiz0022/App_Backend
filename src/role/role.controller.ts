import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { RoleService } from "./role.service";
import { RoleDto } from "./dto/RoleDto";

@Controller('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    create(@Body() roleDto: RoleDto) {
        return this.roleService.createRole(roleDto);
    }

    @Get()
    findAll() {
        return this.roleService.findAllRoles();
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() roleDto: RoleDto) {
        return this.roleService.updateRole(id, roleDto);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.roleService.deleteRole(id);
    }
}