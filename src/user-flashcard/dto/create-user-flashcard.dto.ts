import { IsMongoId, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho kết quả từng thẻ
 */
class CardResultDto {
    @IsMongoId()
    card_id: string;

    @IsBoolean()
    is_correct: boolean;
}

/**
 * DTO để tạo/cập nhật kết quả học flashcard
 * Chỉ lưu kết quả lần gần nhất
 */
export class CreateUserFlashcardDto {
    @IsMongoId()
    deck_id: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CardResultDto)
    cards_result: CardResultDto[];
}
