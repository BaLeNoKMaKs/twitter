import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from 'src/shared/entities/avatar.entity';
import { TweetImage } from 'src/shared/entities/tweetImage.entity';
import { FileProvider } from './file.provider';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar, TweetImage])],
  providers: [FileProvider, FileService],
  exports: [FileProvider, FileService]
})
export class FileModule {}
