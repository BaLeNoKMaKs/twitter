import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../entities/tag.entity';
import { Tweet } from '../entities/tweet.entity';
import { FileModule } from '../file/file.module';
import { UserRepository } from '../users/users.repository';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';
import { Mention } from './../entities/mention.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Tag, UserRepository, Mention]), FileModule],
  controllers: [TweetsController],
  providers: [TweetsService]
})
export class TweetsModule {}
