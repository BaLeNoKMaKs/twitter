import {HttpException, HttpStatus} from "@nestjs/common";

export class UnauthorizedUserException extends HttpException {
    constructor() {
        super("User is invalid", HttpStatus.UNAUTHORIZED);
    }
}