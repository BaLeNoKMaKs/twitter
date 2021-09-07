import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/shared/entities/tag.entity';
import { Tweet } from 'src/shared/entities/tweet.entity';
import { Like, Repository, Not, IsNull, In   } from 'typeorm';
import { CreateTweetDto } from './dto/createTweet.dto';
import { UserRepository } from '../users/users.repository';
import { FileService } from '../file/file.service';

import * as multer from 'multer';
import { User } from 'src/shared/entities/user.entity';
import { UpdateTweetDto } from './dto/updateTweet.dto';
import { Mention } from 'src/shared/entities/mention.entity';
import { SearchTweetDto } from './dto/searchTweet.dto';
import { IdentifyUserException } from 'src/shared/exceptions/identifyUser.exception';
import { TweetNotFoundException } from 'src/shared/exceptions/tweetNotFound.exception';
import { UserNotFoundException } from 'src/shared/exceptions/userNotFound.exception';
import { MentionYourselfException } from 'src/shared/exceptions/mentionYourself.exception';
import { NoRightsException } from 'src/shared/exceptions/noRights.exception';
import { CreateTweetResponse } from './interfaces/createTweetResponse.interface';
import { GetTweetsResponse } from './interfaces/getTweetsResponse.interface';
import { MessageResponse } from './interfaces/messageResponse.interface';
import { MaxLength } from 'class-validator';

@Injectable()
export class TweetsService {

   constructor(
      @InjectRepository(Tag) private readonly TagRepository: Repository<Tag>,
      @InjectRepository(UserRepository) private readonly UserRepository: UserRepository,
      @InjectRepository(Tweet) private readonly TweetRepository: Repository<Tweet>,
      @InjectRepository(Mention) private readonly MentionRepository: Repository<Mention>,
      private readonly FileService: FileService
   ) { }
   
   async getYourTweets(id: number): Promise<Tweet[]> {
        const userTweets = await this.TweetRepository.find({
            where: { user: { id }, mainTweet: null },
        });

        return userTweets;
   }

    async getTweetsByParams(searchTweetDto: SearchTweetDto): Promise<GetTweetsResponse[]> {    
        const allTweets = await this.TweetRepository.find({
            where: {
                text: Like(`%${searchTweetDto.text ? searchTweetDto.text : ""}%`),
                mainTweet: searchTweetDto.comments === "true" ? IsNull() : Not(IsNull()),
            },
            relations: ['user'],
        });

        let finalTweets = null;
        if (searchTweetDto.tags && searchTweetDto.tags.length > 0) {
            finalTweets = allTweets.filter((tweet) => {
                return tweet.tags.some(tag => searchTweetDto.tags.includes(tag.text))
            })
        } else {
            finalTweets = allTweets
        }
        
        const response: GetTweetsResponse[] = [];

        finalTweets.forEach(tweet => {
            const { user, ...rest } = tweet;
            response.push({ user, tweet: rest });
        });

        return response;
    }
   
   async createTweet(
      userId: number,
      createTweetDto: CreateTweetDto,
      files?: multer.File  
   ): Promise<CreateTweetResponse> {
      const foundUser = await this.UserRepository.findOne({ where: { id: userId } });

       if (!foundUser) {
            throw new IdentifyUserException();
      }
     
        const newTweet = this.TweetRepository.create({
            text: createTweetDto.text || "",
            user: foundUser,
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
        const { tweets, password, ...userRest } = foundUser;
        const { user, ...tweetRest } = newTweet;
        return { user: userRest, tweet: tweetRest, message: "Tweet was created successfully" };
   }

    async deleteTweet(id: number): Promise<MessageResponse> {
        const tweetToDelete = await this.TweetRepository.findOne({
            where: { id },
        });

        if (!tweetToDelete) {
            throw new TweetNotFoundException();
        }

        await this.TweetRepository.remove(tweetToDelete);

        return { message: 'Tweet deleted successfully' };
    }
    
    async updateTweet(userId: number, tweetId: number, updateTweetDto: UpdateTweetDto, files?: multer.File) : Promise<CreateTweetResponse> {
        
        const foundUser = await this.UserRepository.findOne({ where: { id: userId } });

        if (!foundUser) {
            throw new IdentifyUserException();
        }
        
        const tweet = await this.TweetRepository.findOne({
            where: { id: tweetId },
        });
        
        if (!tweet) {
            throw new UserNotFoundException()
        }

        if (tweet.user.id !== foundUser.id) {
            throw new NoRightsException();
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
        

        const { tweets, password, ...userRest } = foundUser;
        const { user, ...tweetRest } = newTweet;
        return { user: userRest, tweet: tweetRest, message: "Successfully updated" };
    }
    
    
     async getAllComments(tweetId: number): Promise<GetTweetsResponse[]> {
        const tweet = await this.TweetRepository.findOne({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new TweetNotFoundException();
        }

        const response: GetTweetsResponse[] = [];

        const allComments = await this.TweetRepository.find({
            where: { mainTweet: tweet },
            relations: ['user'],
        });

        allComments.forEach(comment => {
            const { user, ...rest } = comment;
            response.push({ user, tweet: rest });
        });
         
        return response;
    }

    async createComment(
        tweetId: number,
        createTweetDto: CreateTweetDto,
        userId: number,
        files?: multer.File[],
    ) : Promise<CreateTweetResponse> {
        const user = await this.UserRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new IdentifyUserException();
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
    
        const { tweets, password, ...rest } = user;
        return { user: rest, tweet: newTweet, message: "Comment was created successfully" };
    }


   async deleteComment(tweetId: number, tweetToDeleteId: number) : Promise<MessageResponse> {
        const tweet = await this.TweetRepository.findOne({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new TweetNotFoundException();
        }

        const tweetToDelete = await this.TweetRepository.findOne({
            id: tweetToDeleteId,
            mainTweet: tweet,
        });

        if (!tweetToDelete) {
            throw new TweetNotFoundException()
        }

        await this.TweetRepository.remove(tweetToDelete);
        return {message: "Comment was deleted successfully"}
   }

    private async createTags(newTweet: Tweet, tags: string[]) : Promise<void> {
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

    private async createMentions(newTweet: Tweet, mentions: string[], userId: number, oldMentions?: null | Mention[]): Promise<void> {
        await Promise.all(
            mentions.map(async username => {
                const user = await this.UserRepository.findOne({username})
               
                if (!user) {
                    throw new UserNotFoundException();
                }

                if (user.id === userId) {
                    throw new MentionYourselfException();
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

    private async deleteMentions(newMentions, oldMentions): Promise<void> {
        const mentionsToDelete = oldMentions.filter(oldMention => !newMentions.some(newMention=> oldMention.username === newMention.username))
        await Promise.all(
            mentionsToDelete.map(async mention => {
                await this.MentionRepository.remove(mention);
            })
        )
    }

}