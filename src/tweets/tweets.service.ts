import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../entities/tag.entity';
import { Tweet } from '../entities/tweet.entity';
import { Like, Repository, Not, IsNull, In   } from 'typeorm';
import { CreateTweetDto } from './dto/createTweet.dto';
import { UserRepository } from '../users/users.repository';
import { FileService } from '../file/file.service';

import * as multer from 'multer';
import { User } from 'src/entities/user.entity';
import { UpdateTweetDto } from './dto/updateTweet.dto';
import { Mention } from './../entities/mention.entity';
import { SearchTweetDto } from './dto/searchTweet.dto';


@Injectable()
export class TweetsService {

   constructor(
      @InjectRepository(Tag) private readonly TagRepository: Repository<Tag>,
      @InjectRepository(UserRepository) private readonly UserRepository: UserRepository,
      @InjectRepository(Tweet) private readonly TweetRepository: Repository<Tweet>,
      @InjectRepository(Mention) private readonly MentionRepository: Repository<Mention>,
      private readonly FileService: FileService
   ) { }
   
   async getYourTweets(id: number) {
        const userTweets = await this.TweetRepository.find({
            where: { user: { id }, mainTweet: null },
        });

        return userTweets;
   }

    async getTweetsByParams(searchTweetDto: SearchTweetDto) {
        console.log(searchTweetDto)
        console.log(!searchTweetDto.tags)
        const allTweets = await this.TweetRepository.find({
            where: {
                text: Like(`%${searchTweetDto.text ? searchTweetDto.text : ""}%`),
                mainTweet: !searchTweetDto.comments ? IsNull() : Not(IsNull()),
                // tags: {
                //     text: Like("%tag%")
                // }
            },
            relations: ['user', "tags"],
        });

        // const a = await this.TweetRepository
        //     .createQueryBuilder('tweet')
        //     .where("tweet.text = Like(%:text%)", "c").getMany()
        // console.log(a)

        // if (searchTweetDto.tags.length > 0) {
        //     const tags = await this.TagRepository.find({
        //     where: {
        //         text: In(searchTweetDto.tags)
        //     }
        //     })

        //     const tagsArr = tags.map((tag) => tag.text)
        //     console.log(tagsArr)
        //     console.log(allTweets.filter((tweet) => {
        //         tweet.tags.forEach((tag) => {
        //             if (tagsArr.includes(tag.text))
        //                 return true
        //         })
        //         return false
        //     }))    
        // }
        

        // if (searchTweetDto.tags)
        // console.log(allTweets.filter(tweet => {
        //     searchTweetDto.tags.includes(tweet.tags.text)
        // }))
        
        const response: {
            user: User;
            tweet: any;
        }[] = [];

        allTweets.forEach(tweet => {
            const { user, ...rest } = tweet;
            response.push({ user, tweet: rest });
        });

        return response;
    }
   
   async createTweet(
      userId: number,
      createTweetDto: CreateTweetDto,
      files?: multer.File[]  
   ) {
      const user = await this.UserRepository.findOne({ where: { id: userId } });

      if (!user) {
            throw new BadRequestException({ message: 'Cannot identify user' });
      }
     
        const newTweet = this.TweetRepository.create({
            text: createTweetDto.text || "",
            user,
            tags: [],
            comments: [],
            images: [],
            mentions: []
        });

       
        if (files) {
            newTweet.images = await this.FileService.addImagesToTweet(files);
        }

        if (createTweetDto.tags && createTweetDto.tags.length !== 0 && createTweetDto.tags[0] !== '') {
            await this.createTags(newTweet, createTweetDto.tags);
        }
       
        if (createTweetDto.mentions && createTweetDto.mentions.length !== 0 && createTweetDto.mentions[0] !== '') {
            await this.createMentions(newTweet, createTweetDto.mentions, userId);
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
    
    async updateTweet(userId: number, tweetId: number, updateTweetDto: UpdateTweetDto, files?: multer.File[]) {
        
        const user = await this.UserRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new BadRequestException({ message: 'Cannot identify user' });
        }
        
        const tweet = await this.TweetRepository.findOne({
            where: { id: tweetId },
        });
        
        if (!tweet && tweet.user.id !== user.id) {
            throw new BadRequestException({ message: 'Cannot find the tweet or u have not rightn to change it' });
        }
         
        const newTweet = this.TweetRepository.create({
            text: updateTweetDto.text,
            tags: [],
            images: [],
            mentions: []
        })
        
        if (files) {
            newTweet.images = await this.FileService.addImagesToTweet(files);
        } else if (!updateTweetDto.deleteImages) {
            newTweet.images = tweet.images
        }
        
        if (files || updateTweetDto.deleteImages) {
            await this.FileService.deleteTweetImages(tweet.images)
        }

        if (updateTweetDto.tags && updateTweetDto.tags.length !== 0 && updateTweetDto.tags[0] !== '') {
            await this.createTags(newTweet, updateTweetDto.tags);
        } else {
            newTweet.tags = tweet.tags
        }
        
        if (updateTweetDto.mentions && updateTweetDto.mentions.length !== 0 && updateTweetDto.mentions[0] !== '') {
            await this.createMentions(newTweet, updateTweetDto.mentions, userId, tweet.mentions);
            await this.deleteMentions(newTweet.mentions, tweet.mentions)
        } else {
            newTweet.mentions = tweet.mentions;
        }

        await this.TweetRepository.save({...tweet, ...newTweet});
        

        const { tweets, password, ...rest } = user;
        return { user: rest, tweet: newTweet };
    }
    
    
     async getAllComments(tweetId: number) {
        const tweet = await this.TweetRepository.findOne({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new BadRequestException({ message: 'Cannot find post ' });
        }

        const postsTable: {
            user: User;
            tweet: any;
        }[] = [];

        const allComments = await this.TweetRepository.find({
            where: { mainTweet: tweet },
            relations: ['user'],
        });

        allComments.forEach(comment => {
            const { user, ...rest } = comment;
            postsTable.push({ user, tweet: rest });
        });
        return postsTable;
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
            text: createTweetDto.text,
            user,
            tags: [],
            comments: [],
            images: [],
            mentions: [],
            mainTweet: parentTweet,
        });

        if (files) {
            newTweet.images = await this.FileService.addImagesToTweet(files);
        }

        if (createTweetDto.tags && createTweetDto.tags.length !== 0 && createTweetDto.tags[0] !== '') {
            await this.createTags(newTweet, createTweetDto.tags);
        }

        if (createTweetDto.mentions && createTweetDto.mentions.length !== 0 && createTweetDto.mentions[0] !== '') {
            await this.createMentions(newTweet, createTweetDto.mentions, userId);
        }

        await this.TweetRepository.save(newTweet);

        return {message: "comment was created successfully"};
    }


   async deleteComment(tweetId: number, tweetToDeleteId: number) {
        const tweet = await this.TweetRepository.findOne({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new BadRequestException({ message: 'Cannot find post' });
        }

        const tweetToDelete = await this.TweetRepository.findOne({
            id: tweetToDeleteId,
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

    private async createMentions(newTweet: Tweet, mentions: string[], userId: number, oldMentions?: any) {
        await Promise.all(
            mentions.map(async username => {
                const user = await this.UserRepository.findOne({username})
               
                
                if (!user) {
                    throw new BadRequestException({
                        message: 'Username does not exists',
                    });
                }

                 if (user.id === userId) {
                    throw new BadRequestException({
                        message: 'Cannot mention yourself',
                    });
                 }
                
                const mentionedUser = Array.isArray(oldMentions) ? oldMentions.find((mention) => mention.username === username) : false
                
                if (mentionedUser) {
                    newTweet.mentions.push(mentionedUser)
                } else {
                    const newMention = this.MentionRepository.create({
                    username,
                    email: user.email
                    });

                    await this.MentionRepository.save(newMention)

                    newTweet.mentions.push(newMention);
                }
            }),
        );
    }

    private async deleteMentions(newMentions, oldMentions) {
        const mentionsToDelete = oldMentions.filter(oldMention => !newMentions.some(newMention=> oldMention.username === newMention.username))
        await Promise.all(
            mentionsToDelete.map(async mention => {
                await this.MentionRepository.remove(mention);
            })
        )
    }

}