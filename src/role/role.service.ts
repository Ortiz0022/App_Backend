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

    findAllRoles() {
        return this.rolesRepository.find();
    }

    findOneRole(id: number) {
        return this.rolesRepository.findOneBy({ id });
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
