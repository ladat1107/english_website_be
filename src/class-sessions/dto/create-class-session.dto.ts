import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateClassSessionDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description: string;

    @IsNotEmpty()
    @IsUrl()
    link: string;

    @IsNotEmpty()
    date: string;

    @IsNotEmpty()
    @IsString()
    startTime: string;  // 20:30

    @IsOptional()
    @IsString()
    endTime: string; // 21:30

    @IsOptional()
    @IsBoolean()
    is_active: boolean
}
