import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/file/file.service';
import { UserRepository } from "../users/users.repository";
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { InvalidCredentialsException } from './../shared/exceptions/invalidCredentials.exception';
import { multer } from 'multer';
import { AuthResponse } from './interfaces/authResponse.interface';
import { UserExistsException } from './../shared/exceptions/userExists.exception';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserRepository)
        readonly userRepository: UserRepository,
        readonly jwtService: JwtService,
        private readonly FileService: FileService
    ) {}

    async signUp(signUpDto: SignUpDto, file?: multer.File): Promise<void> {
      const user = await this.userRepository.findOne({where: [{username: signUpDto.username}, {email: signUpDto.email}]})   
     
      if (user) {
         throw new UserExistsException();
      }

      const newUser = { ...signUpDto, avatar: null }
          
          if (file) {
              newUser.avatar = await this.FileService.addAvatar(file);
          }
      
          await this.userRepository.signUp(newUser);
      }
   
      async signIn(signInDto: SignInDto): Promise<AuthResponse> {
        const email = await this.userRepository.validateUserPassword(signInDto);
      
        if (!email) {
            throw new InvalidCredentialsException();
        }
        
        const payload: JwtPayload = { email };
         
        const accessToken = await this.generateJwt(payload);
         
        return  { accessToken };
      }
   
      private generateJwt(payload: JwtPayload): Promise<string> {
         return this.jwtService.signAsync(payload);
      }
}