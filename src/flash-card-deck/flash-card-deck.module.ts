import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashCardDeckService } from './flash-card-deck.service';
import { FlashCardDeckController } from './flash-card-deck.controller';
import { FlashCardDeck, FlashCardDeckSchema } from './schemas/flash-card-deck.schemas';
import { UserFlashcardModule } from '@/user-flashcard/user-flashcard.module';
import { GroqModule } from '@/groq/groq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlashCardDeck.name, schema: FlashCardDeckSchema }
    ]),
    UserFlashcardModule,
    GroqModule,
  ],
  controllers: [FlashCardDeckController],
  providers: [FlashCardDeckService],
  exports: [FlashCardDeckService]
})
export class FlashCardDeckModule { }
