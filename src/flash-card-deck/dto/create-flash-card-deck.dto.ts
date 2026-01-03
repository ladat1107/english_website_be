import { IsString, IsBoolean, IsOptional, IsNumber, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlashCardDeckDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsBoolean()
    @IsOptional()
    is_public?: boolean;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    level?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}
