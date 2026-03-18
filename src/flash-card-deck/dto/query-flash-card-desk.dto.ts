import { PaginationDto } from "@/common/dto/filter-query.dto";
import { FlashcardTopic, TypeLanguage } from "@/utils/constants/enum";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export class QueryFlashCardDeckDto extends PaginationDto {
    @IsOptional()
    @IsEnum(FlashcardTopic, { message: 'Chủ đề không hợp lệ' })
    topic?: FlashcardTopic;

    @IsOptional()
    @IsEnum(TypeLanguage, { message: 'Ngôn ngữ không hợp lệ' })
    type?: TypeLanguage;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_admin?: boolean; // Thêm trường is_admin để phân biệt flashcard deck do admin tạo hay user tạo
}