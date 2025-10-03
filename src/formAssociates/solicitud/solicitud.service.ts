import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Solicitud } from './entities/solicitud.entity';
  import { Associate } from 'src/formAssociates/associate/entities/associate.entity';
  import { Persona } from 'src/formAssociates/persona/entities/persona.entity';
  import { CreateSolicitudDto } from './dto/create-solicitud.dto';
  import { ChangeSolicitudStatusDto } from './dto/change-solicitud-status.dto';
  import { SolicitudStatus } from './dto/solicitud-status.enum';
  
  @Injectable()
  export class SolicitudService {
    constructor(
      @InjectRepository(Solicitud)
      private solicitudRepository: Repository<Solicitud>,
      @InjectRepository(Associate)
      private associateRepository: Repository<Associate>,
      @InjectRepository(Persona)
      private personaRepository: Repository<Persona>,
    ) {}
  
    async create(createDto: CreateSolicitudDto): Promise<Solicitud> {
      const existingByCedula = await this.personaRepository.findOne({
        where: { cedula: createDto.persona.cedula },
      });
  
      if (existingByCedula) {
        throw new ConflictException(
          `Ya existe una persona con la cédula ${createDto.persona.cedula}`,
        );
      }
  
      const existingByEmail = await this.personaRepository.findOne({
        where: { email: createDto.persona.email },
      });
  
      if (existingByEmail) {
        throw new ConflictException(
          `Ya existe una persona con el email ${createDto.persona.email}`,
        );
      }
  
      const persona = this.personaRepository.create(createDto.persona);
      await this.personaRepository.save(persona);
  
      const asociado = this.associateRepository.create({
        persona,
        distanciaFinca: createDto.datosAsociado.distanciaFinca,
        viveEnFinca: createDto.datosAsociado.viveEnFinca,
        marcaGanado: createDto.datosAsociado.marcaGanado,
        CVO: createDto.datosAsociado.CVO,
        estado: false,
      });
      await this.associateRepository.save(asociado);
  
      const solicitud = this.solicitudRepository.create({
        persona,
        asociado,
        fechaSolicitud: new Date(),
        estado: SolicitudStatus.PENDIENTE,
      });
  
      return this.solicitudRepository.save(solicitud);
    }
  
    async findAll() {
      return this.solicitudRepository.find({
        relations: ['persona', 'asociado', 'asociado.fincas'],
        order: { createdAt: 'DESC' },
      });
    }
  
    async findOne(id: number): Promise<Solicitud> {
      const solicitud = await this.solicitudRepository.findOne({
        where: { idSolicitud: id },
        relations: ['persona', 'asociado', 'asociado.fincas'],
      });
  
      if (!solicitud) {
        throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
      }
  
      return solicitud;
    }
  
    async changeStatus(
      id: number,
      changeStatusDto: ChangeSolicitudStatusDto,
    ): Promise<Solicitud> {
      const solicitud = await this.findOne(id);
  
      if (
        changeStatusDto.estado === SolicitudStatus.RECHAZADO &&
        !changeStatusDto.motivo
      ) {
        throw new BadRequestException(
          'El motivo es obligatorio cuando se rechaza una solicitud',
        );
      }
  
      if (solicitud.estado !== SolicitudStatus.PENDIENTE) {
        throw new BadRequestException(
          'Solo se pueden procesar solicitudes pendientes',
        );
      }
  
      solicitud.estado = changeStatusDto.estado;
      solicitud.fechaResolucion = new Date();
      solicitud.motivo =
        changeStatusDto.estado === SolicitudStatus.RECHAZADO
          ? changeStatusDto.motivo
          : undefined;
  
      await this.solicitudRepository.save(solicitud);
  
      if (changeStatusDto.estado === SolicitudStatus.APROBADO) {
        solicitud.asociado.estado = true;
        await this.associateRepository.save(solicitud.asociado);
      }
  
      return this.findOne(id);
    }
  
    async remove(id: number): Promise<void> {
      const solicitud = await this.findOne(id);
  
      if (solicitud.estado === SolicitudStatus.APROBADO) {
        throw new BadRequestException(
          'No se puede eliminar una solicitud aprobada',
        );
      }
  
      if (solicitud.asociado) {
        await this.associateRepository.remove(solicitud.asociado);
      }
  
      await this.solicitudRepository.remove(solicitud);
    }
  
    async findByStatus(status: SolicitudStatus) {
      return this.solicitudRepository.find({
        where: { estado: status },
        relations: ['persona', 'asociado', 'asociado.fincas'],
        order: { createdAt: 'DESC' },
      });
    }
  
    async countByStatus(status: SolicitudStatus): Promise<number> {
      return this.solicitudRepository.count({
        where: { estado: status },
      });
    }
  }