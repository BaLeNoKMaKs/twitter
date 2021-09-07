import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt.auth.guard';
import { TweetsService } from './tweets.service';
import { User } from '../shared/decorators/user.decorator';
import { CreateTweetDto } from './dto/createTweet.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateTweetDto } from './dto/updateTweet.dto';
import { SearchTweetDto } from './dto/searchTweet.dto';
import { multer } from 'multer';
import { Tweet } from 'src/shared/entities/tweet.entity';
import { GetTweetsResponse } from './interfaces/getTweetsResponse.interface';
import { CreateTweetResponse } from './interfaces/createTweetResponse.interface';
import { MessageResponse } from './interfaces/messageResponse.interface';

@Controller('api')
@UseGuards(JwtAuthGuard) 
export class TweetsController {
   constructor(private readonly TweetsService: TweetsService) { }

    @Get('tweets/me')
    getYourTweets(@User('id') userId: number) : Promise<Tweet[]> {
        return this.TweetsService.getYourTweets(userId);
    }

    @Get("tweets")
    getTweetsByParams(@Query() searchTweetDto: SearchTweetDto) : Promise<GetTweetsResponse[]> {
        return this.TweetsService.getTweetsByParams(searchTweetDto);
    }
   
    @Post('tweets')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'tweetImages', maxCount: 10 }]),
    )
    createTweet(
        @User('id') userId: number,
        @Body() createTweetDto: CreateTweetDto,
        @UploadedFiles() files?: multer.File,
    ) : Promise<CreateTweetResponse> {
        return this.TweetsService.createTweet(userId, createTweetDto, files?.tweetImages);
    }

    @Delete('tweets/:id')
    deleteTweet(@Param('id', new ParseIntPipe()) tweetId: number) : Promise<MessageResponse> {
        return this.TweetsService.deleteTweet(tweetId);
    }

    @Patch('tweets/:tweetId')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'tweetImages', maxCount: 10 }]),
    )
    updateTweet(
        @Param('tweetId', ParseIntPipe) tweetId: number,
        @Body() updateTweetDto: UpdateTweetDto,
        @User("id") userId: number,
        @UploadedFiles() files?: multer.File,
    ): Promise<CreateTweetResponse> {
        return this.TweetsService.updateTweet(userId, tweetId, updateTweetDto, files?.tweetImages);
    }
    
    @Get('/comments/:tweetId')
    getAllComments(@Param('tweetId', new ParseIntPipe()) tweetId: number): Promise<GetTweetsResponse[]> {
        return this.TweetsService.getAllComments(tweetId);
    }

    @Post('/comments/:tweetId')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'tweetImages', maxCount: 5 }]),
    )
    createComment(
        @User('id') userId: number,
        @Body() createTweetDto: CreateTweetDto,
        @Param('tweetId', new ParseIntPipe()) tweetId: number,
        @UploadedFiles() files?: multer.File,
    ): Promise<CreateTweetResponse> {
        return this.TweetsService.createComment(tweetId, createTweetDto, userId, files?.tweetImages);
    }

    @Delete('comments/:tweetId/:id')
    deleteComment(@Param('tweetId', new ParseIntPipe()) tweetId: number, @Param('id', new ParseIntPipe()) id: number): Promise<MessageResponse>{
        return this.TweetsService.deleteComment(tweetId, id);
    }  
}


