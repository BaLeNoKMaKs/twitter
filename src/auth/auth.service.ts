import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import  bcrypt  from 'bcrypt';
import { UserRepository } from 'src/users/users.repository';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { JwtPayload } from './interfaces/jwt.payload.interface';
@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserRepository)
        readonly userRepository: UserRepository,
        readonly jwtService: JwtService,
    ) {}

  signUp(signUpDto: SignUpDto): Promise<void> {
         return this.userRepository.signUp(signUpDto);
  }
   
      async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
        const email = await this.userRepository.validateUserPassword(signInDto);
        if (!email) {
            throw new UnauthorizedException('Invalid credentials');
        }
         const payload: JwtPayload = { email };
         
         const accessToken = await this.generateJwt(payload);
         
        console.log(`Generated JWT Token with payload ${JSON.stringify(payload)}`);
        return  { accessToken };
      }
   
   
      private generateJwt(payload: JwtPayload) {
         return this.jwtService.signAsync(payload);
      }
}