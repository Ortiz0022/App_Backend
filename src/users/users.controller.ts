import { Body, Controller, Get, Param, Patch, Post, ParseIntPipe } from "@nestjs/common";
import { Roles } from "src/auth/roles.decorator";
import { Public } from "src/auth/public.decorator";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/CreateUserDto";
import { UpdateUserDto } from "./dto/UpdateUserDto";
import { AdminSetPasswordDto } from "./dto/AdminSetPasswordDto";
import { ConfirmEmailChangeDto, RequestEmailChangeDto } from "./dto/EmailChange";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CONFIGURACIÓN (solo ADMIN)
  @Get()
  @Roles("ADMIN")
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(":id")
  @Roles("ADMIN")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOneUser(id);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(":id/password")
  @Roles("ADMIN")
  setPassword(@Param("id", ParseIntPipe) id: number, @Body() dto: AdminSetPasswordDto) {
    return this.usersService.adminSetPassword(id, dto.password);
  }

  @Patch(":id/deactivate")
  @Roles("ADMIN")
  deactivate(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.setActive(id, false);
  }

  @Patch(":id/activate")
  @Roles("ADMIN")
  activate(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.setActive(id, true);
  }

  // Cambio de email con confirmación (admin solicita)
  @Post(":id/request-email-change")
  @Roles("ADMIN", "JUNTA")
  requestEmailChange(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: RequestEmailChangeDto,
  ) {
    return this.usersService.requestEmailChange(id, dto.newEmail);
  }

  // Confirmación pública desde link en correo nuevo
  @Public()
  @Post("confirm-email-change")
  confirmEmailChange(@Body() dto: ConfirmEmailChangeDto) {
    return this.usersService.confirmEmailChange(dto.token);
  }
}
