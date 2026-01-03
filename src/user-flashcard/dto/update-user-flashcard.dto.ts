import { PartialType } from '@nestjs/mapped-types';
import { CreateUserFlashcardDto } from './create-user-flashcard.dto';

export class UpdateUserFlashcardDto extends PartialType(CreateUserFlashcardDto) { }
