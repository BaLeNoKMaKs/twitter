import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TweetsModule } from './tweets/tweets.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [TypeOrmModule.forRoot(), ConfigModule.forRoot({isGlobal: true}), AuthModule, UsersModule, TweetsModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
