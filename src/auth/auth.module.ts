import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from 'src/users/users.repository';
import { JwtAuthGuard } from './guards/jwt.auth.guard';

@Module({
  imports: [  
    PassportModule,
    JwtModule.register({
    secret: process.env.JWT_SECRET || "SECRET",
    signOptions: {
      expiresIn: "1h",
    },
  }),
    TypeOrmModule.forFeature([UserRepository])
  ],
  
  controllers: [AuthController],
  providers: [AuthService,  JwtStrategy]
})
export class AuthModule {}
