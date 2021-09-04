import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/file/file.service';
import { UserRepository } from "../users/users.repository";
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { JwtPayload } from './interfaces/jwt.payload.interface';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserRepository)
        readonly userRepository: UserRepository,
        readonly jwtService: JwtService,
        private readonly FileService: FileService
    ) {}

    async signUp(signUpDto: SignUpDto, file?: any): Promise<void> {
         const newUser = { ...signUpDto, avatar: null }
    
        if (file) {
            newUser.avatar = await this.FileService.addAvatar(file);
        }
         return this.userRepository.signUp(newUser);
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