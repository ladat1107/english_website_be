import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashCardDeckService } from './flash-card-deck.service';
import { FlashCardDeckController } from './flash-card-deck.controller';
import { FlashCardDeck, FlashCardDeckSchema } from './schemas/flash-card-deck.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlashCardDeck.name, schema: FlashCardDeckSchema }
    ])
  ],
  controllers: [FlashCardDeckController],
  providers: [FlashCardDeckService],
  exports: [MongooseModule]
})
export class FlashCardDeckModule { }
