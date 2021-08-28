
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guard';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }
   
    @Post('signup')
    async signUp(@Body() signUpDto: SignUpDto): Promise<{ accessToken: string }> {
        await this.authService.signUp(signUpDto);
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