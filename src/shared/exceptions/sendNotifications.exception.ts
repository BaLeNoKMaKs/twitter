import {HttpException, HttpStatus} from "@nestjs/common";

export class SendNotificationsException extends HttpException {
    constructor() {
        super("Cannot send notifications", HttpStatus.BAD_REQUEST);
    }
}