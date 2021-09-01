import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt.auth.guard';
import { TweetsService } from './tweets.service';
import { User } from './../decorators/user.decorator';
import { CreateTweetDto } from './dto/createTweet.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateTweetDto } from './dto/updateTweet.dto';

@Controller('api')
@UseGuards(JwtAuthGuard) 
export class TweetsController {
   constructor(private readonly TweetsService: TweetsService) { }

    @Get('tweets/me')
    getYourTweets(@User('id') userId: number) {
        return this.TweetsService.getYourTweets(userId);
    }

    
   
    @Post('tweets')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'tweetImages', maxCount: 10 }]),
    )
    createTweet(
        @User('id') userId: number,
        @Body() createTweetDto: CreateTweetDto,
        @UploadedFiles() files?: any,
    ) {
        return this.TweetsService.createTweet(userId, createTweetDto, files?.tweetImages);
    }

    @Delete('tweets/:id')
    deleteTweet(@Param('id', new ParseIntPipe()) tweetId: number) {
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
        @UploadedFiles() files?: any,
    ) {
        return this.TweetsService.updateTweet(userId, tweetId, updateTweetDto, files?.TweetImage);
    }
    
    @Get('/comments/:tweetId')
    getAllComments(@Param('tweetId', new ParseIntPipe()) tweetId: number) {
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
        @UploadedFiles() files?: any,
    ) {
        return this.TweetsService.createComment(tweetId, createTweetDto, userId, files?.tweetImages);
    }

    @Delete('comments/:tweetId/:id')
    deleteComment(@Param('tweetId', new ParseIntPipe()) tweetId: number, @Param('id', new ParseIntPipe()) id: number) {
        return this.TweetsService.deleteComment(tweetId, id);
    }  
}


