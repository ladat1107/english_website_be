import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserFlashcard, UserFlashcardDocument } from './schemas/user-flashcard.schemas';
import { FlashCardDeckDocument } from '@/flash-card-deck/schemas/flash-card-deck.schemas';
import { JwtPayload } from '@/auth/auth.service';
import { UserRole } from '@/utils/constants/enum';
import { UsersService } from '@/user/user.service';
import { QueryFlashCardDeckDto } from '@/flash-card-deck/dto/query-flash-card-desk.dto';
import { UpdateStudyProgressDto } from './dto/update-user-flashcard.dto';
import { buildVietnameseRegex } from '@/utils/functions/function';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';
import dayjs from 'dayjs';

@Injectable()
export class UserFlashcardService {
  constructor(
    @InjectModel(UserFlashcard.name)
    private readonly userFlashcardModel: Model<UserFlashcardDocument>,
    private userServive: UsersService,
  ) { }

  async create(flashDesk: FlashCardDeckDocument, user: JwtPayload, session?: any) {
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
  async findAll(query: QueryFlashCardDeckDto, user?: JwtPayload) {
    try {
      const { page = 1, limit = 10, search, topic, type } = query;
      const matchStage: any = { ['flashcarddeck.is_admin']: true }; // Mặc định chỉ lấy flashcard deck do admin tạo

      if (topic) { matchStage['flashcarddeck.topic'] = topic; }

      if (type) { matchStage['flashcarddeck.type'] = type; }

      const buildSearch = search ? buildVietnameseRegex(search) : null;

      if (buildSearch) {
        matchStage['$or'] = [
          { 'flashcarddeck.title': buildSearch, $options: 'i' },
          { 'flashcarddeck.description': buildSearch, $options: 'i' },
        ];
      }

      const userId = user ? new Types.ObjectId(user._id) : null;

      const pipeline: any = [
        { $match: { user_id: userId } },
        {
          $lookup: {
            from: 'flashcarddecks',
            localField: 'deck_id',
            foreignField: '_id',
            as: 'flashcarddeck',
            pipeline: [
              { $match: matchStage },
            ],
          },
        },
        { $unwind: '$flashcarddeck' }, // Mỗi user flashcard sẽ tương ứng với 1 flashcard deck (do đã match ở pipeline lookup)
        { $sort: { 'flashcarddeck.title': 1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: calculateSkip(page, limit) }, { $limit: limit }],
          },
        },
        {
          $unwind: {
            path: "$metadata",
            preserveNullAndEmptyArrays: true
          }
        }
      ];
      const result = await this.userFlashcardModel.aggregate(pipeline);

      // Fix: điều kiện đúng là result.length === 0 (không có dữ liệu)
      if (!result || result.length === 0) {
        return createPaginatedResponse([], 0, page, limit);
      }

      return createPaginatedResponse(result[0].data, result[0]?.metadata?.total || 0, page, limit);

    } catch (error) {
      console.error('Error fetching user flashcard results:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách deck của user để add flashcard
   * Bao gồm: deck của user + deck admin
   */
  async getMyDecks(user: JwtPayload) {
    try {
      const userId = new Types.ObjectId(user._id);

      const pipeline: any = [
        {
          $match: { created_by: userId },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            image: 1,
            topic: 1,
            type: 1,
            flashcards_count: { $size: '$flashcards' }
          }
        },
        { $sort: { title: 1 } }
      ];

      const result = await this.userFlashcardModel.db.collection('flashcarddecks').aggregate(pipeline).toArray();

      return result;

    } catch (error) {
      console.error('Error fetching user decks:', error);
      throw error;
    }
  }

  /**
   * Cập nhật tiến độ học - ghi nhận kết quả correct/incorrect cho từng card
   * Tính toán lại correct_cards, incorrect_cards từ cards_result
   */
  async updateProgress(dto: UpdateStudyProgressDto, user: JwtPayload) {
    try {
      const userId = new Types.ObjectId(user._id);
      const deckId = new Types.ObjectId(dto.deck_id);

      // Lấy record hiện tại (hoặc tạo mới nếu chưa có)
      let userFlashcard = await this.userFlashcardModel.findOne({
        user_id: userId,
        deck_id: deckId,
      });

      if (!userFlashcard) {
        userFlashcard = await this.userFlashcardModel.create({
          user_id: userId,
          deck_id: deckId,
          cards_result: [],
        });
      }

      // Merge kết quả mới vào cards_result hiện tại
      const existingResults = new Map(
        userFlashcard.cards_result.map((r) => [r.card_id.toString(), r]),
      );

      for (const cardResult of dto.cards_result) {
        existingResults.set(cardResult.card_id, {
          card_id: new Types.ObjectId(cardResult.card_id) as any,
          status: cardResult.status,
          last_studied_at: dayjs().toDate(),
        });
      }

      const mergedResults = Array.from(existingResults.values());

      // Tính lại số correct/incorrect
      const correct_cards = mergedResults.filter(
        (r) => r.status === 'correct',
      ).length;
      const incorrect_cards = mergedResults.filter(
        (r) => r.status === 'incorrect',
      ).length;

      // Cập nhật
      const updated = await this.userFlashcardModel.findOneAndUpdate(
        { user_id: userId, deck_id: deckId },
        {
          $set: {
            cards_result: mergedResults,
            correct_cards,
            incorrect_cards,
            last_studied_at: new Date(),
          },
        },
        { new: true },
      );

      return updated;
    } catch (error) {
      console.error('Error updating study progress:', error);
      throw error;
    }
  }

  /**
   * Xóa kết quả học
   */
  async remove(deck_id: string, user_id?: string | null, session?: any) {
    try {
      if (!user_id) {
        // Nếu không có user_id, xóa tất cả kết quả học của deck đó (dành cho admin khi xóa flashcard deck)
        await this.userFlashcardModel.deleteMany({ deck_id: new Types.ObjectId(deck_id) }, { session });
      } else {
        // Nếu có user_id, chỉ xóa kết quả học của user đó với deck đó (dành cho user khi muốn reset kết quả học)
        await this.userFlashcardModel.deleteOne(
          { deck_id: new Types.ObjectId(deck_id), user_id: new Types.ObjectId(user_id) },
          { session }
        );
      }
    } catch (error) {
      console.error('Error removing user flashcard result:', error);
      throw error;
    }
  }
}
