import { Injectable } from '@nestjs/common';
import { Avatar } from '../entities/avatar.entity';
import { TweetImage } from '../entities/tweetImage.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import multer from "multer"
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class FileService {
   constructor(
      @InjectRepository(Avatar)
      private readonly AvatarRepository: Repository<Avatar>,

      @InjectRepository(TweetImage)
      private readonly TweetImageRepository: Repository<TweetImage>,
   ) { }
      
   async addImagesToTweet(files: multer.File[]) {
      const sendImages = files.map(async file => {
         const upload = await this.uploadFile(file);
         const image = this.TweetImageRepository.create({
            url: upload.secure_url || upload.url,
            key: upload.public_id
         });

         return await image.save();
      });

      return await Promise.all(sendImages);
   }
  

   async addAvatar(file: multer.File) {
      const upload = await this.uploadFile(file[0]);
         
      const avatar = this.AvatarRepository.create({
         url: upload.secure_url || upload.url,
         key: upload.public_id
      });

      return await avatar.save();
   }

   async deleteAvatar(image) {
      await this.deleteFile(image.key);
      await this.AvatarRepository.remove(image);
   }

   async deleteTweetImages(prevImages) {
      const deletedImages = prevImages.map(async image => {
         await this.deleteFile(image.key);
         await this.TweetImageRepository.remove(image);
      });

      return await Promise.all(deletedImages);
   }

    private uploadFile(
     file: multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
         console.log(error, "error")
        if (error) return reject(error);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
   }
   
   private deleteFile(
     key: string
  ) {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(key, function(error,result) {
       if (error) return reject(error);
        resolve(result);
      });
    });
  }
}