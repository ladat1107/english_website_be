import { IsEnum, IsOptional, IsString, IsBoolean, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import { LevelExam, SpeakingTopic, TypeLanguage } from "@/utils/constants/enum";
import { PaginationDto } from "@/common/dto/filter-query.dto";

/**
 * Query DTO kế thừa Base Pagination + Filter riêng
 */
export class QuerySpeakingExamDto extends PaginationDto {
    @IsOptional()
    @IsEnum(SpeakingTopic, { message: 'Topic không hợp lệ' })
    topic?: SpeakingTopic;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_published?: boolean;

    @IsOptional()
    @IsEnum(LevelExam, { message: "Cấp độ không hợp lệ" })
    level?: LevelExam;

    @IsOptional({ message: "Ngôn ngữ không được để trống" })
    @IsEnum(TypeLanguage, { message: "Ngôn ngữ không hợp lệ" })
    type?: TypeLanguage;
}