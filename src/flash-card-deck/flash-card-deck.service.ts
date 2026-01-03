import { Injectable } from '@nestjs/common';
import { CreateFlashCardDeckDto } from './dto/create-flash-card-deck.dto';
import { UpdateFlashCardDeckDto } from './dto/update-flash-card-deck.dto';

@Injectable()
export class FlashCardDeckService {
  create(createFlashCardDeckDto: CreateFlashCardDeckDto) {
    return 'This action adds a new flashCardDeck';
  }

  findAll() {
    return `This action returns all flashCardDeck`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flashCardDeck`;
  }

  update(id: number, updateFlashCardDeckDto: UpdateFlashCardDeckDto) {
    return `This action updates a #${id} flashCardDeck`;
  }

  remove(id: number) {
    return `This action removes a #${id} flashCardDeck`;
  }
}
