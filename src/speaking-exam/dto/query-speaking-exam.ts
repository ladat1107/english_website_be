import { IsEnum, IsOptional, IsString, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { SpeakingTopic } from "@/utils/constants/enum";
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
}