import { BlogCategory } from "@/utils/constants/enum";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBlogDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    image: string;

    @IsEnum(BlogCategory)
    @IsNotEmpty()
    category: BlogCategory;

    @IsBoolean()
    @IsOptional()
    is_public: boolean;

    @IsBoolean()
    @IsOptional()
    is_special: boolean;
}
