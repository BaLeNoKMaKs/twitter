
import { Controller, Post, Body, Get, UseGuards, Req, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthResponse } from './interfaces/authResponse.interface';


@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]),
    )
    @Post('signup') 
    async signUp(@Body() signUpDto: SignUpDto, @UploadedFiles() files?: any): Promise<AuthResponse> {
        await this.authService.signUp(signUpDto, files?.avatar);
        const {email, password} = signUpDto
        return this.authService.signIn({email, password})
    }

    @Post('signin')
    signIn(@Body() signInDto: SignInDto): Promise<AuthResponse> {
        return this.authService.signIn(signInDto);
    }
}