export class AssociateDto {
  // Personal Information
  idNumber: string;
  name: string;
  lastName1: string;
  lastName2: string;
  birthDate: string;

  // Contact Information
  phone: string;
  email: string;
  address: string;
  community: string;

  // Associate Information
  needs?: string;

  // Documents (como nombres o rutas de archivos)
  idCopy?: string;
  farmDiagnosis?: string;
  paymentProof?: string;
  farmMap?: string;
  otherDocuments?: string;

  // Terms
  acceptTerms: boolean;
  receiveInfo: boolean;
}