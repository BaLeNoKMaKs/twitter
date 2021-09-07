import {HttpException, HttpStatus} from "@nestjs/common";

export class MentionYourselfException extends HttpException {
    constructor() {
        super("Cannot mention yourself", HttpStatus.BAD_REQUEST);
    }
}