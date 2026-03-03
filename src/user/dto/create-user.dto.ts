import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string;

    @IsString()
    @IsNotEmpty({ message: "Tên không được để trống" })
    full_name: string;

    @IsOptional()
    @IsString()
    googleId: string;

    @IsString()
    @IsOptional()
    role: string;

    @IsOptional()
    avatar_url?: string;

    @IsOptional()
    target_exam?: string;

    @IsOptional()
    target_score?: number;

    @IsOptional()
    current_level?: string;

    @IsOptional()
    target_date?: Date;

    @IsOptional()
    learning_goals?: string[];

    @IsOptional()
    @Matches(/^\d{10}$/, {
        message: 'Điện thoại phải là 10 chữ số',
    })
    phone?: string;
}
