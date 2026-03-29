import { PaginationDto } from "@/common/dto/filter-query.dto";
import { Transform } from "class-transformer";
import { IsBoolean, IsMongoId, IsOptional } from "class-validator";

export class QueryWritingAnswerDto extends PaginationDto {
    @IsOptional()
    @IsMongoId()
    writing_exam_id?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_pinned?: boolean;
}
