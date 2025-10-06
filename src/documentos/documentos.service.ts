import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { Documento } from './entities/documento.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepository: Repository<Documento>,
  ) {}

  async create(createDocumentoDto: CreateDocumentoDto) {
    const documento = this.documentoRepository.create(createDocumentoDto);
    return await this.documentoRepository.save(documento);
  }

  async findByAsociado(idAsociado: number) {
    return await this.documentoRepository.find({
      where: { idAsociado },
    });
  }

  async findAll() {
    return await this.documentoRepository.find();
  }
}