import { MinLength, MaxLength, IsString, Matches } from 'class-validator';

export class SignUpDto {
    @IsString()
    @MinLength(4)
    @MaxLength(40)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
        message: 'Password is too weak',
    })
    password: string;

    @IsString()
    name: string;
    
    @IsString()
    @MaxLength(20)
    username: string;

}