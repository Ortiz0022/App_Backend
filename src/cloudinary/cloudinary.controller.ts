import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Post,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryService } from './cloudinary.service'

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('usage')
  usage() {
    return this.cloudinaryService.getUsage()
  }

@Get('gallery')
getGallery(@Query('maxResults') maxResults?: string, @Query('nextCursor') nextCursor?: string) {
  return this.cloudinaryService.getGallery({
    maxResults: maxResults ? Number(maxResults) : 50,
    nextCursor,
  });
}


  // ✅ (si ya lo tenés, dejalo): /cloudinary/upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 👈 el campo debe llamarse "file"
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required')

    // subimos buffer con upload_stream
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'image' }, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
        .end(file.buffer)
    })

    return {
      public_id: result.public_id,
      url: result.secure_url,
    }
  }

  // ✅ NUEVO: /cloudinary/:publicId
  @Delete(':publicId')
  delete(@Param('publicId') publicId: string) {
    return this.cloudinaryService.delete(publicId)
  }

    @Get('health')
  async health() {
    return this.cloudinaryService.healthCheck()
  }

  @Post('inspect-file')
  @UseInterceptors(FileInterceptor('file'))
  inspectFile(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.inspectIncomingFile(file)
  }

  @Post('upload-safe')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSafe(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required')
    }

    try {
      console.log('[Cloudinary] upload-safe received:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer,
        bufferLength: file.buffer?.length ?? 0,
      })

      const result = await this.cloudinaryService.uploadBufferSafe(file)

      console.log('[Cloudinary] upload-safe success:', result)

      return result
    } catch (error: any) {
      console.error('[Cloudinary] upload-safe error:', error)

      throw new InternalServerErrorException({
        message: 'Cloudinary upload failed',
        error: error?.message ?? 'Unknown error',
      })
    }
  }
}
