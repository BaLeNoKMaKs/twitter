import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt.payload.interface';
import { User } from 'src/users/entities/users.entity';
import { UserRepository } from 'src/users/users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UsingJoinColumnOnlyOnOneSideAllowedError } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(UserRepository)
        private userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY_JWT || "SECRET",
    });
  }

 async validate(payload: JwtPayload): Promise<User> {
   const { email } = payload;
  console.log(payload, "email")
    const user = await this.userRepository.findOne({ email });
    if (!user) {
        throw new UnauthorizedException('User is invalid');
    }
    return user;
    }
}