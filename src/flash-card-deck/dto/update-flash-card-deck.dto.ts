import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashCardDeckDto } from './create-flash-card-deck.dto';

export class UpdateFlashCardDeckDto extends PartialType(CreateFlashCardDeckDto) {}
