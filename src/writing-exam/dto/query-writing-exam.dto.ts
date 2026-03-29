import { PaginationDto } from "@/common/dto/filter-query.dto";
import { LevelExam, TypeLanguage } from "@/utils/constants/enum";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export class QueryWritingExamDto extends PaginationDto {
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_published?: boolean;

    @IsOptional()
    @IsEnum(TypeLanguage, { message: "Ngôn ngữ không hợp lệ" })
    type?: TypeLanguage;

    @IsOptional()
    @IsEnum(LevelExam, { message: "Mức độ không hợp lệ" })
    level?: LevelExam;
}
