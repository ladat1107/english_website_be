import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFlashcardService } from './user-flashcard.service';
import { UserFlashcardController } from './user-flashcard.controller';
import { UserFlashcard, UserFlashcardSchema } from './schemas/user-flashcard.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserFlashcard.name, schema: UserFlashcardSchema }
    ])
  ],
  controllers: [UserFlashcardController],
  providers: [UserFlashcardService],
  exports: [MongooseModule]
})
export class UserFlashcardModule { }
