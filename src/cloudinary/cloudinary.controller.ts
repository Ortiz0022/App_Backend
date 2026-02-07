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
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CloudinaryService } from './cloudinary.service'
import { v2 as cloudinary } from 'cloudinary'

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('usage')
  usage() {
    return this.cloudinaryService.getUsage()
  }

  @Get('gallery')
  getGallery(
    @Query('maxResults') maxResults?: string,
    @Query('nextCursor') nextCursor?: string,
  ) {
    return this.cloudinaryService.getGallery({
      maxResults: maxResults ? Number(maxResults) : 50,
      nextCursor,
    })
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any) {
    if (!file?.buffer) throw new BadRequestException('File is required')

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

  @Delete(':publicId')
  delete(@Param('publicId') publicId: string) {
    return this.cloudinaryService.delete(publicId)
  }
}
