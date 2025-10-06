export class CreateDocumentoDto {
  idAsociado: number;
  idSolicitud?: number;
  tipoDocumento: string;
  nombreArchivo: string;
  cloudinaryId: string;
  urlPublica: string;
  tamanioBytes: number;
}