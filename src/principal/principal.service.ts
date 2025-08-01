import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Principal } from './entities/principal.entity';
import { PrincipalDto } from './dto/PrincipalDto';
 
@Injectable()
export class PrincipalService {
  constructor(
    @InjectRepository(Principal)
    private principalRepository: Repository<Principal>,
  ) {}

  // Métodos para Principal
  findAllPrincipal() {
    return this.principalRepository.find();
  }

  findOnePrincipal(id: number) {
    return this.principalRepository.findOneBy({ id });
  }

  async createPrincipal(principalDto: PrincipalDto) {
    const newPrincipal = this.principalRepository.create(principalDto);
    await this.principalRepository.save(newPrincipal);
    return newPrincipal;
  }

  deletePrincipal(id: number) {
    return this.principalRepository.delete(id);
  }

  updatePrincipal(id: number, principalDto: PrincipalDto) {
    return this.principalRepository.update(id, principalDto);
  }
}