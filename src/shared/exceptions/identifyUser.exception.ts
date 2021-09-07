import {HttpException, HttpStatus} from "@nestjs/common";

export class IdentifyUserException extends HttpException {
    constructor() {
        super("Cannot identify user", HttpStatus.BAD_REQUEST);
    }
}