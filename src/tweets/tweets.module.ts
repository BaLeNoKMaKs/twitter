import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from 'src/shared/entities/tag.entity';
import { Tweet } from 'src/shared/entities/tweet.entity';
import { Mention } from 'src/shared/entities/mention.entity';
import { FileModule } from '../file/file.module';
import { UserRepository } from '../users/users.repository';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Tag, UserRepository, Mention]), FileModule],
  controllers: [TweetsController],
  providers: [TweetsService]
})
export class TweetsModule {}
