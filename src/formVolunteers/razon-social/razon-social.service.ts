import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateRazonSocialDto } from './dto/create-razon-social.dto';
import { UpdateRazonSocialDto } from './dto/update-razon-social.dto';
import { RazonSocial } from './entities/razon-social.entity';
import { Organizacion } from '../organizacion/entities/organizacion.entity';

@Injectable()
export class RazonSocialService {
  constructor(
    @InjectRepository(RazonSocial)
    private razonSocialRepository: Repository<RazonSocial>,
  ) {}

  // Método transaccional (sin validaciones, usa EntityManager externo)
  async createInTransaction(
    createRazonSocialDto: CreateRazonSocialDto,
    organizacion: Organizacion,
    manager: EntityManager,
  ): Promise<RazonSocial> {
    const razonSocial = manager.create(RazonSocial, {
      razonSocial: createRazonSocialDto.razonSocial,
      organizacion,
    });

    return manager.save(razonSocial);
  }

  async findAll(): Promise<RazonSocial[]> {
    return this.razonSocialRepository.find({
      relations: ['organizacion'],
    });
  }

  async findOne(id: number): Promise<RazonSocial> {
    const razonSocial = await this.razonSocialRepository.findOne({
      where: { idRazonSocial: id },
      relations: ['organizacion'],
    });

    if (!razonSocial) {
      throw new NotFoundException(`Razón Social con ID ${id} no encontrada`);
    }

    return razonSocial;
  }

  async findByOrganizacion(idOrganizacion: number): Promise<RazonSocial[]> {
    return this.razonSocialRepository.find({
      where: { organizacion: { idOrganizacion } },
    });
  }

  async update(
    id: number,
    updateRazonSocialDto: UpdateRazonSocialDto,
  ): Promise<RazonSocial> {
    const razonSocial = await this.findOne(id);

    if (updateRazonSocialDto.razonSocial !== undefined) {
      razonSocial.razonSocial = updateRazonSocialDto.razonSocial;
    }

    return this.razonSocialRepository.save(razonSocial);
  }

  async remove(id: number): Promise<void> {
    const razonSocial = await this.findOne(id);
    await this.razonSocialRepository.remove(razonSocial);
  }
}