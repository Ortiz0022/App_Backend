import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { Repository } from "typeorm";
import { RoleDto } from "./dto/RoleDto";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

   async onModuleInit() {
    const roles = await this.rolesRepository.find();
    if (roles.length === 0) {
      await this.rolesRepository.save([
        { name: 'ADMIN' },
        { name: 'JUNTA' },
      ]);
    }
  }

    findAllRoles() {
        return this.rolesRepository.find();
    }

    async createRole(roleDto: RoleDto) {
        const newRole = this.rolesRepository.create(roleDto);
        await this.rolesRepository.save(newRole);
        return newRole;
    }

    deleteRole(id: number) {
        return this.rolesRepository.delete(id);
    }

    updateRole(id: number, roleDto: RoleDto) {
        return this.rolesRepository.update(id, roleDto);
    }
}
