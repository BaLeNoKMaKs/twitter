import {HttpException, HttpStatus} from "@nestjs/common";

export class UserNotFoundException extends HttpException {
    constructor() {
        super("cannot find a user", HttpStatus.NOT_FOUND);
    }
}