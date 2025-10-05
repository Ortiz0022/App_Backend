import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal } from './entities/animal.entity';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { Hato } from 'src/formFinca/hato/entities/hato.entity';

@Injectable()
export class AnimalService {
  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
    @InjectRepository(Hato)
    private readonly hatoRepository: Repository<Hato>,
  ) {}

  async create(createDto: CreateAnimalDto): Promise<Animal> {
    const { idHato, nombre, edad } = createDto;

    // Verificar que el hato existe
    const hato = await this.hatoRepository.findOne({
      where: { idHato },
    });

    if (!hato) {
      throw new NotFoundException(`Hato con ID ${idHato} no encontrado`);
    }

    const animal = this.animalRepository.create({
      nombre,
      edad,
      hato,
    });

    return await this.animalRepository.save(animal);
  }

  async findAll(): Promise<Animal[]> {
    return await this.animalRepository.find({
      relations: ['hato', 'hato.finca'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Animal> {
    const animal = await this.animalRepository.findOne({
      where: { idAnimal: id },
      relations: ['hato', 'hato.finca'],
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado`);
    }

    return animal;
  }

  async findByHato(idHato: number): Promise<Animal[]> {
    return await this.animalRepository.find({
      where: { hato: { idHato } },
      relations: ['hato'],
      order: {
        nombre: 'ASC',
      },
    });
  }

  async update(id: number, updateDto: UpdateAnimalDto): Promise<Animal> {
    const animal = await this.findOne(id);

    Object.assign(animal, updateDto);
    return await this.animalRepository.save(animal);
  }

  async remove(id: number): Promise<void> {
    const animal = await this.findOne(id);
    await this.animalRepository.remove(animal);
  }

  // Método auxiliar para contar animales por hato
  async countByHato(idHato: number): Promise<number> {
    return await this.animalRepository.count({
      where: { hato: { idHato } },
    });
  }
}