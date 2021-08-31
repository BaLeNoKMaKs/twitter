import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../entities/tag.entity';
import { Tweet } from '../entities/tweet.entity';
import { Repository } from 'typeorm';
import { CreateTweetDto } from './dto/createTweet.dto';
import { UserRepository } from '../users/users.repository';
import { FileService } from '../file/file.service';

import * as multer from 'multer';

@Injectable()
export class TweetsService {

   constructor(
      @InjectRepository(Tag) private readonly TagRepository: Repository<Tag>,
      @InjectRepository(UserRepository) private readonly UserRepository: UserRepository,
      @InjectRepository(Tweet) private readonly TweetRepository: Repository<Tweet>,
      private readonly FileService: FileService
   ) { }
   
   async getYourTweets(id: number) {
        const userTweets = await this.TweetRepository.find({
            where: { user: { id }, mainTweet: null },
        });

        return userTweets;
   }
   
   async createTweet(
      id: number,
      createTweetDto: CreateTweetDto,
      files?: multer.File[]  
   ) {
      const user = await this.UserRepository.findOne({ where: { id } });

      if (!user) {
            throw new BadRequestException({ message: 'Cannot identify user' });
      }
        const newTweet = this.TweetRepository.create({
            gif: createTweetDto.gif,
            text: createTweetDto.text,
            user,
            tags: [],
            comments: [],
            images: [],
        });

        if (files) {
            newTweet.images = await this.FileService.addImagesToTweet(files);
        }

        if (createTweetDto.tags.length !== 0 && createTweetDto.tags[0] !== '') {
            await this.createTags(newTweet, createTweetDto.tags);
        }

        await this.TweetRepository.save(newTweet);
        const { tweets, ...rest } = user;
        return { user: rest, tweet: newTweet };
   }

   async deleteTweet(id: number) {
        const tweetToDelete = await this.TweetRepository.findOne({
            where: { id },
        });

        if (!tweetToDelete) {
            throw new BadRequestException({ message: 'Cannot find a tweet' });
        }

        await this.TweetRepository.remove(tweetToDelete);

        return { message: 'Tweet deleted successfully' };
   }

    async createComment(
        tweetId: number,
        createTweetDto: CreateTweetDto,
        userId: number,
        files?: multer.File[],
    ) {
        const user = await this.UserRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException({ message: 'Cannot identify user' });
        }

        const parentTweet = await this.TweetRepository.findOne({
            where: { id: tweetId },
            relations: ['comments'],
        });

        const newTweet = this.TweetRepository.create({
            gif: createTweetDto.gif,
            text: createTweetDto.text,
            user,
            tags: [],
            comments: [],
            images: [],
            mainTweet: parentTweet,
        });

        if (files) {
            newTweet.images = await this.FileService.addImagesToTweet(files);
        }

        if (createTweetDto.tags.length !== 0 && createTweetDto.tags[0] !== '') {
            await this.createTags(newTweet, createTweetDto.tags);
        }

        await this.TweetRepository.save(newTweet);

        return {message: "comment was created successfully"};
    }


   async deleteComment(postId: number, postToDeleteId: number) {
        const tweet = await this.TweetRepository.findOne({
            where: { id: postId },
        });

        if (!tweet) {
            throw new BadRequestException({ message: 'Cannot find post' });
        }

        const tweetToDelete = await this.TweetRepository.findOne({
            id: postToDeleteId,
            mainTweet: tweet,
        });

        if (!tweetToDelete) {
            throw new BadRequestException({
                message: 'Cannot find post to delete',
            });
        }

        return await this.TweetRepository.remove(tweetToDelete);
    }

    private async createTags(newTweet: Tweet, tags: string[]) {
        await Promise.all(
            tags.map(async tag => {
                const isTag = await this.TagRepository.findOne({
                    where: { text: tag },
                });

                if (isTag) {
                    newTweet.tags.push(isTag);
                } else {
                    const newTag = this.TagRepository.create({
                        text: tag,
                    });
                    await newTag.save();

                    newTweet.tags.push(newTag);
                }
            }),
        );
    }

}


// {
//     "user": {
//         "id": 2,
//         "fullName": "Maxim",
//         "username": "browlStars12",
//         "email": "max-dev-work123@mal.ru",
//         "password": "$2b$12$Z8CvNzCUa/w2RJyL98S3W.oO967Hx9StBGyk1fhj7x3k/cKzfLHnK",
//         "createdAt": "2021-08-30T08:19:57.411Z",
//         "updatedAt": "2021-08-30T08:19:57.411Z",
//         "avatar": null
//     },
//     "tweet": {
//         "text": "this is my first tweet",
//         "user": {
//             "id": 2,
//             "fullName": "Maxim",
//             "username": "browlStars12",
//             "email": "max-dev-work123@mal.ru",
//             "password": "$2b$12$Z8CvNzCUa/w2RJyL98S3W.oO967Hx9StBGyk1fhj7x3k/cKzfLHnK",
//             "createdAt": "2021-08-30T08:19:57.411Z",
//             "updatedAt": "2021-08-30T08:19:57.411Z",
//             "avatar": null
//         },
//         "images": [],
//         "tags": [
//             {
//                 "text": "killallmen",
//                 "id": 1
//             },
//             {
//                 "text": "pony",
//                 "id": 2
//             }
//         ],
//         "comments": [],
//         "gif": null,
//         "id": 1,
//         "createdAt": "2021-08-30T08:22:04.331Z",
//         "updatedAt": "2021-08-30T08:22:04.331Z"
//     }
// }