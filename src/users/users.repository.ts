import { Repository, EntityRepository } from 'typeorm';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignInDto } from '../auth/dto/signIn.dto';
import { SignUpDto } from '../auth/dto/signUp.dto';
import { User } from 'src/shared/entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async signUp(signUpDto: SignUpDto): Promise<void> {
        const hashPassword = await this.hashPassword(signUpDto.password);
        
        const user = await this.create({...signUpDto, password: hashPassword});
       
        await this.save(user);
    }
 
    async validateUserPassword(signInDto: SignInDto): Promise<string> {
        const { email, password } = signInDto;
        const user = await this.findOne({ email });

        if (user && await this.comparePasswords(password, user.password)) {
            return user.email;
        } else {
            return null;
        }
   }
   
   private hashPassword(password: string):  Promise<string> {
        return bcrypt.hash(password, 12);
   }
   
   private comparePasswords(password: string, storedPasswordHash: string): Promise<boolean>{
        return bcrypt.compare(password, storedPasswordHash);
    }
}
