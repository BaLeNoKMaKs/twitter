import { Body, Controller, Delete, Get, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt.auth.guard';
import { TweetsService } from './tweets.service';
import { User } from './../decorators/user.decorator';
import { CreateTweetDto } from './dto/createTweet.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('api')
@UseGuards(JwtAuthGuard) 
export class TweetsController {
   constructor(private readonly TweetsService: TweetsService) { }

    @Get('tweets/me')
    getYourTweets(@User('id') id: number) {
        console.log(id)
        return this.TweetsService.getYourTweets(id);
    }
   
    @Post('tweets')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'tweetImages', maxCount: 10 }]),
       )
    createTweet(
        @User('id') id: number,
        @Body() createTweetDto: CreateTweetDto,
        @UploadedFiles() files?: any,
    ) {
        return this.TweetsService.createTweet(id, createTweetDto, files?.tweetImages);
    }

    @Delete('tweets/:id')
    deleteTweet(@Param('id') id: number) {
        return this.TweetsService.deleteTweet(id);
    }
    
    @Get('/comments/:id')
    getComments(@Param('postId') postId: string) {
        return this.tweetService.getAllComments(postId);
    }

    @Post('/comments')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'tweetImages', maxCount: 5 }]),
    )
    comment(
        @User('id') id: string,
        @Body() createTweetDto: CreateTweetDto,
        @Param('tweetId') tweetId: string,
        @UploadedFiles() files?: any,
    ) {
        return this.tweetService.comment(tweetId, data, id, files?.tweetImages);
    }

    @Delete('comments/:tweetId/:id')
    @UseGuards(AuthGuard)
    deleteComment(@Param('postId') postId: string, @Param('id') id: string) {
        return this.tweetService.deleteComment(postId, id);
    }

}


