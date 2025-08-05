import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}
  
    findAllUsers() {
        return this.usersRepository.find();
    }

    findOneUser(id: number) {
        return this.usersRepository.findOneBy({ id });
    }
    async createUser(userDto: any) {
        const newUser = this.usersRepository.create(userDto);
        await this.usersRepository.save(newUser);
        return newUser;
    }

    deleteUser(id: number) {
        return this.usersRepository.delete(id);
    }

    updateUser(id: number, userDto: any) {
        return this.usersRepository.update(id, userDto);
    }
}