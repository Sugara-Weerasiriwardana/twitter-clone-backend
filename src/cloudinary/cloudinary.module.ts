import { Module } from '@nestjs/common';
import cloudinary from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      useValue: cloudinary,
    },
  ],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
