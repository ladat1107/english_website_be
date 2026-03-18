import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashCardDeckDto, CreateFlashcardDto } from './create-flash-card-deck.dto';
import { IsMongoId } from 'class-validator';

export class UpdateFlashCardDto extends PartialType(CreateFlashcardDto) {
    @IsMongoId()
    _id: string; // ID của flashcard cần cập nhật
}
export class UpdateFlashCardDeckDto extends PartialType(CreateFlashCardDeckDto) { }
