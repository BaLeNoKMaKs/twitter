import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../users/users.repository';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [  
    PassportModule,
    JwtModule.register({
    secret: process.env.JWT_SECRET || "SECRET",
    signOptions: {
      expiresIn: "1h",
    },
  }),
    TypeOrmModule.forFeature([UserRepository]),
    FileModule
  ],
  
  controllers: [AuthController],
  providers: [AuthService,  JwtStrategy]
})
export class AuthModule {}
