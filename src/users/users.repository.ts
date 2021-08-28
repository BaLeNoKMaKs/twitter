import { Repository, EntityRepository } from 'typeorm';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/users.entity';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { SignUpDto } from 'src/auth/dto/signUp.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
   async signUp(signUpDto: SignUpDto): Promise<void> {
       const hashPassword = await this.hashPassword(signUpDto.password);
       const user = this.create({...signUpDto, password: hashPassword});
       
      try {
          await this.save(user);
        
        } catch (error) {
            if (error.code === '23505') {// Duplicate error
                throw new ConflictException('email already exists');
            } else {
                throw new InternalServerErrorException();
            }
        }
    }
 
    async validateUserPassword(signInDto: SignInDto): Promise<string> {
        const { email, password } = signInDto;
        const user = await this.findOne({ email });
        console.log("user", user)
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