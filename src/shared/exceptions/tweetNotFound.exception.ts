import {HttpException, HttpStatus} from "@nestjs/common";

export class TweetNotFoundException extends HttpException {
    constructor() {
        super("cannot find a tweet", HttpStatus.NOT_FOUND);
    }
}