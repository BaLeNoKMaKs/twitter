
import { Controller, Post, Body, Get, UseGuards, Req, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';


@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]),
    )
    @Post('signup') 
    async signUp(@Body() signUpDto: SignUpDto, @UploadedFiles() files?: any): Promise<{ accessToken: string }> {
        await this.authService.signUp(signUpDto, files?.avatar);
        const {email, password} = signUpDto
        return this.authService.signIn({email, password})
    }

    @Post('signin')
    signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
        return this.authService.signIn(signInDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get("protected") 
    getInfo(@Req() request) {
        console.log(request.user)
        return "protected"
    }

    @Get()
    getInfo2(@Body() body) {
        return "not protected"
    }
}