import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

/** Kết quả học của từng card */
export class CardResultDto {
    @IsMongoId()
    @IsNotEmpty()
    card_id: string;

    @IsEnum(['correct', 'incorrect'])
    @IsNotEmpty()
    status: 'correct' | 'incorrect';
}

/** DTO cập nhật tiến độ học flashcard */
export class UpdateStudyProgressDto {
    @IsMongoId()
    @IsNotEmpty()
    deck_id: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CardResultDto)
    cards_result: CardResultDto[];

    @IsString()
    @IsOptional()
    mode?: string; // 'flip' | 'learn' | 'test' | 'match'
}
