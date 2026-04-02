import { PaginationDto } from "@/common/dto/filter-query.dto";
import { BlogCategory } from "@/utils/constants/enum";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export class QueryBlogDto extends PaginationDto {

    @IsEnum(BlogCategory)
    @IsOptional()
    category: BlogCategory;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    is_public: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    is_special: boolean;
}
