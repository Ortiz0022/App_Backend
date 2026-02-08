import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserDto } from "./dto/UserDto";
import { Roles } from "src/auth/roles.decorator";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Post()
    @Roles('ADMIN')
    create(@Body() userDto: UserDto) {
        return this.usersService.createUser(userDto);
    }
    @Roles('ADMIN', 'JUNTA')
    @Get()
    findAll() {
        return this.usersService.findAllUsers();
    }

    @Roles('ADMIN', 'JUNTA')
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOneUser(id);
    }
    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: number, @Body() userDto: UserDto) {
        return this.usersService.updateUser(id, userDto);
    }
    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id') id: number) {
        return this.usersService.deleteUser(id);
    }
}