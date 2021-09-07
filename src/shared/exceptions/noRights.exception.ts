import {HttpException, HttpStatus} from "@nestjs/common";

export class NoRightsException extends HttpException {
    constructor() {
        super("Not enough rights", HttpStatus.FORBIDDEN);
    }
}