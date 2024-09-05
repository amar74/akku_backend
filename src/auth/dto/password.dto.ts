import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty()
    new_password: string;
}

export class ForgotPasswordDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }: { value: string }) => value.toLowerCase())
    @ApiProperty()
    email: string;
}