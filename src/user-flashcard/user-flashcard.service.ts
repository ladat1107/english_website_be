import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserFlashcard, UserFlashcardDocument } from './schemas/user-flashcard.schemas';
import { FlashCardDeckDocument } from '@/flash-card-deck/schemas/flash-card-deck.schemas';
import { JwtPayload } from '@/auth/auth.service';
import { UserRole } from '@/utils/constants/enum';
import { UsersService } from '@/user/user.service';

@Injectable()
export class UserFlashcardService {
  constructor(
    @InjectModel(UserFlashcard.name)
    private readonly userFlashcardModel: Model<UserFlashcardDocument>,
    private userServive: UsersService,
  ) { }

  async create(flashDesk: FlashCardDeckDocument, user: JwtPayload, session: any) {
    try {
      if (user.role === UserRole.ADMIN) {
        const users = await this.userServive.getUserByRole([UserRole.STUDENT, UserRole.TEACHER]);
        const userIds = users.map(u => new Types.ObjectId(u._id));
        const createUserFlashCard = await this.userFlashcardModel.insertMany(
          userIds.map(user_id => ({
            user_id,
            deck_id: new Types.ObjectId(flashDesk._id),
          })),
          {
            session,
            ordered: false // nếu có lỗi (ví dụ duplicate key) sẽ bỏ qua và tiếp tục insert các bản ghi còn lại -> không dừng toàn bộ quá trình insert, đảm bảo tất cả user đều có kết quả học flashcard dù có lỗi ở một vài bản ghi
          }
        );
        return createUserFlashCard;

      } else {
        const createUserFlashCard = await this.userFlashcardModel.create([
          {
            user_id: new Types.ObjectId(user._id),
            deck_id: new Types.ObjectId(flashDesk._id),
          },
        ],
          { session });
        return createUserFlashCard;
      }

    } catch (error) {
      console.error('Error saving user flashcard result:', error);
      throw error;
    }
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
