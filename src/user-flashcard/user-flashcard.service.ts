import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserFlashcardDto } from './dto/create-user-flashcard.dto';
import { UserFlashcard } from './schemas/user-flashcard.schemas';

@Injectable()
export class UserFlashcardService {
  constructor(
    @InjectModel(UserFlashcard.name) private userFlashcardModel: Model<UserFlashcard>,
  ) { }

  /**
   * Lưu kết quả học flashcard (ghi đè kết quả cũ)
   * Tự động tính toán số câu đúng/sai
   */
  async saveResult(createUserFlashcardDto: CreateUserFlashcardDto) {
    // TODO: Lấy user_id từ JWT token trong request
    const user_id = 'temp_user_id'; // Placeholder

    const correctCards = createUserFlashcardDto.cards_result.filter(c => c.is_correct).length;
    const incorrectCards = createUserFlashcardDto.cards_result.filter(c => !c.is_correct).length;

    // Upsert: Tạo mới hoặc cập nhật nếu đã tồn tại
    return this.userFlashcardModel.findOneAndUpdate(
      { user_id, deck_id: createUserFlashcardDto.deck_id },
      {
        user_id,
        deck_id: createUserFlashcardDto.deck_id,
        total_cards: createUserFlashcardDto.cards_result.length,
        correct_cards: correctCards,
        incorrect_cards: incorrectCards,
        last_studied_at: new Date(),
        cards_result: createUserFlashcardDto.cards_result,
      },
      { new: true, upsert: true },
    );
  }

  /**
   * Lấy kết quả học của user cho 1 deck
   */
  async getByDeck(deckId: string) {
    // TODO: Lấy user_id từ JWT token
    const user_id = 'temp_user_id';
    return this.userFlashcardModel.findOne({ user_id, deck_id: deckId });
  }

  /**
   * Lấy tất cả kết quả học của user
   */
  async findAll() {
    // TODO: Lấy user_id từ JWT token
    const user_id = 'temp_user_id';
    return this.userFlashcardModel.find({ user_id });
  }

  /**
   * Xóa kết quả học
   */
  async remove(id: string) {
    return this.userFlashcardModel.findByIdAndDelete(id);
  }
}
