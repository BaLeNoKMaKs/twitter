import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../entities/tag.entity';
import { Tweet } from '../entities/tweet.entity';
import { FileModule } from '../file/file.module';
import { UserRepository } from '../users/users.repository';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Tag, UserRepository]), FileModule],
controllers: [TweetsController],
  providers: [TweetsService]
})
export class TweetsModule {}
