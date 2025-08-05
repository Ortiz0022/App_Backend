import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserDto } from "./dto/UserDto";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Post()
    create(@Body() userDto: UserDto) {
        return this.usersService.createUser(userDto);
    }
    @Get()
    findAll() {
        return this.usersService.findAllUsers();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOneUser(id);
    }
    @Put(':id')
    update(@Param('id') id: number, @Body() userDto: UserDto) {
        return this.usersService.updateUser(id, userDto);
    }
    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.usersService.deleteUser(id);
    }
}