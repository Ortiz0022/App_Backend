import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
  
  @ValidatorConstraint({ name: 'PropietarioConditional', async: false })
  export class PropietarioConditionalValidator implements ValidatorConstraintInterface {
    validate(datosPropietario: any, args: ValidationArguments) {
      const dto = args.object as CreateSolicitudDto;
  
      // Si NO es propietario, datosPropietario es OBLIGATORIO
      if (!dto.datosAsociado.esPropietario && !datosPropietario) {
        return false;
      }
  
      // Si ES propietario, datosPropietario debe estar vacío
      if (dto.datosAsociado.esPropietario && datosPropietario) {
        return false;
      }
  
      return true;
    }
  
    defaultMessage(args: ValidationArguments) {
      const dto = args.object as CreateSolicitudDto;
      if (!dto.datosAsociado.esPropietario) {
        return 'Se requieren los datos del propietario cuando el asociado NO es propietario';
      }
      return 'No se deben enviar datos del propietario cuando el asociado ES propietario';
    }
  }