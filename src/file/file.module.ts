import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './../entities/avatar.entity';
import { TweetImage } from './../entities/tweetImage.entity';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar, TweetImage])],
providers: [FileService],
exports: [FileService]
})
export class FileModule {}
