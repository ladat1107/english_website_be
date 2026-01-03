import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { Flashcard, FlashcardSchema } from './schemas/flashcard.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flashcard.name, schema: FlashcardSchema }
    ])
  ],
  controllers: [FlashcardController],
  providers: [FlashcardService],
  exports: [MongooseModule]
})
export class FlashcardModule { }
