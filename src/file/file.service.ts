import { Injectable } from '@nestjs/common';
import { Avatar } from '../entities/avatar.entity';
import { TweetImage } from '../entities/tweetImage.entity';
import { v4 as uuid } from 'uuid';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


import {v2 as cloudinary} from "cloudinary";
import cloudinaryStorage from "cloudinary-multer";
import multer from "multer"

cloudinary.config({ 
  cloud_name: 'maxdevtwitter', 
  api_key: '912822669229832', 
  api_secret: 'isombGs_wFKbLKUMq5FWFB0o6Z4' 
});

// const storage = cloudinaryStorage({
//   cloudinary
// });

// import multer from 'multer';
// import  multerDbx  from 'multer-dropbox';
// import { Dropbox } from 'dropbox';
// import fetch from 'isomorphic-fetch';

// const dbx = new Dropbox({
//   accessToken: "sl.A3dLLmWN0aNwKoCNvSA0IRxC3IohkiPItlsX9iuRyYr7XkTMl1-xtxJhHKqM5iZMXZNrDN5f5pY5PoVrZsnui25-ACdArylqrLWHbgpAJ8POr4tNNIP74zTz5i5Eprr07LrO8eQ",
//   fetch
// })
//  console.log(multerDbx)
// const storage = multerDbx(
//   dbx,
//   {
//       path : function( req, file, cb ) {
    
//       	cb( null, '/multer-uploads/' + file.originalname );
 
//       },
//       mute: true
//   });
 
// var uploadMiddleware = multer({ storage })

// var storage = multer.diskStorage({
//     destination: function(req, file, callback){
//         callback(null, './public/upload');
//     },
//     filename: function(req, file, callback){
//         var filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
//         callback(null, filename);
//     }
// });

// const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
// const s3 = new AWS.S3();
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

@Injectable()
export class FileService {
   constructor(
      @InjectRepository(Avatar)
      private readonly AvatarRepository: Repository<Avatar>,

      @InjectRepository(TweetImage)
      private readonly TweetImageRepository: Repository<TweetImage>,
   ) { }
      
   async addImagesToTweet(files: multer.File[]) {
      //   const s3 = new S3();

      console.log(files, "files")
      const sendImages = files.map(async file => {
         // const upload = await this.uploadFile(file.buffer, s3);
         console.log(file, "file")
         const upload = await cloudinary.uploader.upload(file.path)
         console.log(upload)
         const image = this.TweetImageRepository.create({
               key: upload.Key,
               url: upload.Location,
         });

         return await image.save();
      });

      return await Promise.all(sendImages);
   }
   
//     uploadFile = multer({
//   storage: storage,
// });
      
   // async addAvatarToUser(data: Buffer) {
   //    // const s3 = new S3();

   //    // const upload = await this.uploadFile(data, s3);
   //          // const upload = await this.uploadFile(file.buffer, s3);


   //    const avatar = this.AvatarRepository.create({
   //          key: upload.Key,
   //          url: upload.Location,
   //    });

   //    await avatar.save();

   //    return avatar;
   //  }
   
   
   //  upload = multer({ storage })
   
   // async uploadFile(data: Buffer, s3: S3) {
   //      return await s3
   //          .upload({
   //              Bucket: process.env.BUCKET_NAME,
   //              Body: data,
   //              Key: uuid(),
   //              ACL: 'public-read',
   //          })
   //         .promise();  
   // }
   
//    upload = multer({
//     storage: multerS3({
//       s3: s3,
//       bucket: AWS_S3_BUCKET_NAME,
//       acl: 'public-read',
//       key: function(request, file, cb) {
//         cb(null, `${Date.now().toString()} - ${file.originalname}`);
//       },
//     }),
//   }).array('upload', 1);


    
}
