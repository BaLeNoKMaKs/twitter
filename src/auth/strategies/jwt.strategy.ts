import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { UserRepository } from '../../users/users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { UnauthorizedUserException } from '../../shared/exceptions/unauthorizedUser.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(UserRepository)
  private userRepository: UserRepository,
  private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('SECRET_KEY_JWT'),
    });
  } 

 async validate(payload: JwtPayload): Promise<User> {
   const { email } = payload;
   
   const user = await this.userRepository.findOne({ email });
   
    if (!user) {
        throw new UnauthorizedUserException();
    }
    return user;
    }
}