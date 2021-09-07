import { MinLength, MaxLength, IsString, Matches, IsEmail } from 'class-validator';

export class SignInDto {
    @IsString()
    @MinLength(4)
    @MaxLength(40)
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
        message: 'Password is too weak',
    })
    password: string;
}