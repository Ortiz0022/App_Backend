import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Projection } from '../projection/entities/projection.entity';
import { CreateCategoryDto } from './dto/createCategoryDto';
import { UpdateCategoryDto } from './dto/updateCategoryDto';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private repo: Repository<Category>,
    @InjectRepository(Projection) private projectionRepo: Repository<Projection>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const projection = await this.projectionRepo.findOne({ where: { id: dto.projectionId } });
    if (!projection) throw new NotFoundException('projection not found');

    const entity = this.repo.create({
      name: dto.name,
      description: dto.description,
      category_amount: dto.category_amount ?? undefined, // default 0 en BD
      projection: projection,
    });

    return this.repo.save(entity);
  }

  findAll(projectionId?: number) {
    if (projectionId) {
      return this.repo.find({
        where: { projection: { id: projectionId } },
        relations: ['projection'],
        order: { name: 'ASC' },
      });
    }
    return this.repo.find({ relations: ['projection'], order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['projection'] });
    if (!cat) throw new NotFoundException('projection not found');
    return cat;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['projection'] });
    if (!cat) throw new NotFoundException('Category not found');

    Object.assign(cat, dto);

    return this.repo.save(cat);
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');
    await this.repo.delete(id);
  }
}
