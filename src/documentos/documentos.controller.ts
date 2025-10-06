import { Controller, Get, Post, Body, Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { cedula: string; nombre: string; idAsociado: number },
  ) {
    const folderName = `Asociados/${body.cedula}-${body.nombre}`;
    const uploadedFiles: any[] = [];

    for (const file of files) {
      const result: any = await this.cloudinaryService.uploadFile(file, folderName);

      const documento = await this.documentosService.create({
        idAsociado: body.idAsociado,
        tipoDocumento: file.fieldname,
        nombreArchivo: file.originalname,
        cloudinaryId: result.public_id,
        urlPublica: result.secure_url,
        tamanioBytes: result.bytes,
      });

      uploadedFiles.push(documento);
    }

    return {
      success: true,
      folderUrl: this.cloudinaryService.getRootFolderUrl(),
      files: uploadedFiles,
    };
  }

  @Get('cloudinary-folder')
  getCloudinaryFolderUrl() {
    return {
      url: this.cloudinaryService.getRootFolderUrl(),
    };
  }

  @Get('asociado/:id')
  findByAsociado(@Param('id') id: string) {
    return this.documentosService.findByAsociado(+id);
  }
}