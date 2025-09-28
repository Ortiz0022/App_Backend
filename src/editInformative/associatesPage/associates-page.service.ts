// src/associatesPage/associates-page.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AssociatesPage } from './entities/associates-page.entity';
import { UpsertAssociatesPageDto } from './dto/upsert-associates-page.dto';
import { Benefit } from './entities/benefit.entity';
import { Requirement } from './entities/requirement.entity';

@Injectable()
export class AssociatesPageService {
  constructor(
    @InjectRepository(AssociatesPage) private readonly pageRepo: Repository<AssociatesPage>,
    @InjectRepository(Benefit) private readonly benefitRepo: Repository<Benefit>,
    @InjectRepository(Requirement) private readonly reqRepo: Repository<Requirement>,
    private readonly ds: DataSource,
  ) {}

  async get(): Promise<AssociatesPage> {
    const page = await this.pageRepo.findOne({
      where: {}, // <- requerido por TypeORM >= 0.3
      relations: ['benefits', 'requirements'],
      order: {
        benefits: { order: 'ASC' },
        requirements: { order: 'ASC' },
      } as any,
    });

    if (!page) throw new NotFoundException('No hay contenido para AssociatesPage.');
    return page;
  }

  async upsert(payload: UpsertAssociatesPageDto): Promise<AssociatesPage> {
    return await this.ds.transaction(async (trx) => {
      // buscar la única fila existente (si hay)
      let page = await trx.getRepository(AssociatesPage).findOne({ where: {} });

      if (!page) {
        // crear página
        page = trx.getRepository(AssociatesPage).create({
          headerTitle: payload.headerTitle,
          headerDescription: payload.headerDescription,
        });
        page = await trx.getRepository(AssociatesPage).save(page);
      } else {
        // actualizar encabezado
        page.headerTitle = payload.headerTitle;
        page.headerDescription = payload.headerDescription;
        await trx.getRepository(AssociatesPage).save(page);

        // limpiar hijos anteriores
        await trx.getRepository(Benefit).delete({ page: { id: page.id } as any });
        await trx.getRepository(Requirement).delete({ page: { id: page.id } as any });
      }

      // recrear hijos
      const benefitRepo = trx.getRepository(Benefit);
      const reqRepo = trx.getRepository(Requirement);

      const benefits = (payload.benefits ?? []).map((b, idx) =>
        benefitRepo.create({
          iconName: b.iconName,
          title: b.title,
          desc: b.desc,
          order: b.order ?? idx,
          page,
        }),
      );

      const requirements = (payload.requirements ?? []).map((r, idx) =>
        reqRepo.create({
          text: r.text,
          order: r.order ?? idx,
          page,
        }),
      );

      await benefitRepo.save(benefits);
      await reqRepo.save(requirements);

      // recargar con relaciones ordenadas
      const reloaded = await trx.getRepository(AssociatesPage).findOneOrFail({
        where: { id: page.id },
        relations: ['benefits', 'requirements'],
        order: {
          benefits: { order: 'ASC' },
          requirements: { order: 'ASC' },
        } as any,
      });

      return reloaded;
    });
  }

  async seedIfEmpty(): Promise<void> {
    const count = await this.pageRepo.count();
    if (count > 0) return;

    await this.upsert({
      headerTitle: '¿Por qué ser asociado en la Cámara de Ganaderos?',
      headerDescription:
        'Ser asociado te permite impulsar el crecimiento del sector ganadero local, fortalecer el desarrollo sostenible de la comunidad y formar parte activa de iniciativas que promueven el bienestar del agro y el medio ambiente.',
      benefits: [
        { iconName: 'Users', title: 'Red de Contactos', desc: 'Comunidad ganadera sólida y colaborativa.' },
        { iconName: 'Heart', title: 'Apoyo Técnico y Legal', desc: 'Orientación especializada agro, legal y administrativa.' },
        { iconName: 'Award', title: 'Oportunidades Exclusivas', desc: 'Programas, proyectos y ferias de la Cámara.' },
      ],
      requirements: [
        { text: 'Autorizar el uso de datos y participación en actividades.' },
        { text: 'Finca registrada con información técnica básica.' },
        { text: 'Completar el formulario de Diagnóstico de Finca.' },
        { text: 'Participar en programas de capacitación.' },
        { text: 'Compromiso con prácticas sostenibles.' },
        { text: 'Ser productor ganadero activo.' },
      ],
    });
  }
}
