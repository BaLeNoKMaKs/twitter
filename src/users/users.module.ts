import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from '../users/users.repository';
import { FileModule } from '../file/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), FileModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
