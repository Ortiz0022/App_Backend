export class PersonaFormLookupDto {
  found: boolean;

  persona?: {
    idPersona: number;
    cedula: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    telefono: string;
    email: string;
    fechaNacimiento: string;
    direccion?: string;
  };

  volunteerIndividual?: {
    idNumber: string;
    name: string;
    lastName1: string;
    lastName2: string;
    phone: string;
    email: string;
    birthDate: string;
    address: string;
  };

  representanteOrganizacion?: {
    persona: {
      cedula: string;
      nombre: string;
      apellido1: string;
      apellido2: string;
      telefono: string;
      email: string;
      fechaNacimiento: string;
      direccion?: string;
    };
  };

  legacy?: {
    firstname: string;
    lastname1: string;
    lastname2: string;
  };
}
