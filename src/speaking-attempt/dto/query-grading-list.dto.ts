import { IsEnum, IsMongoId, IsOptional, IsString, Min, IsNumber, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '@/common/dto/filter-query.dto';
import { SpeakingTopic } from '@/utils/constants/enum';

export class QueryGradingListDto extends PaginationDto {
    @IsOptional()
    @IsEnum(SpeakingTopic)
    topic?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    has_teacher_feedback?: boolean;
}
