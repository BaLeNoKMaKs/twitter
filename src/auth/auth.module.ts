import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../users/users.repository';
import { FileModule } from '../file/file.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
   PassportModule, 
    JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret:  configService.get('SECRET_KEY_JWT'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRES_IN'),
                },
            }),
            inject: [ConfigService],
        }),
    TypeOrmModule.forFeature([UserRepository]),
    FileModule,
    ConfigModule
  ],
  
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
