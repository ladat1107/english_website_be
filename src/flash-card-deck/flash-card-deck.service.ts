import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFlashCardDeckDto, CreateFlashcardDto } from './dto/create-flash-card-deck.dto';
import { UpdateFlashCardDeckDto, UpdateFlashCardDto } from './dto/update-flash-card-deck.dto';
import { JwtPayload } from '@/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { FlashCardDeck, FlashCardDeckDocument } from './schemas/flash-card-deck.schemas';
import { Model, Types } from 'mongoose';
import { UserRole } from '@/utils/constants/enum';
import { UserFlashcardService } from '@/user-flashcard/user-flashcard.service';

@Injectable()
export class FlashCardDeckService {
  constructor(
    @InjectModel(FlashCardDeck.name)
    private readonly flashCardDeckModel: Model<FlashCardDeckDocument>,
    private userFlashcardService: UserFlashcardService,
  ) { }

  async create(createFlashCardDeckDto: CreateFlashCardDeckDto, user: JwtPayload) {
    const session = await this.flashCardDeckModel.db.startSession();
    session.startTransaction();
    try {
      // Logic tạo flashcard deck mới
      const createdDeck = await this.flashCardDeckModel.create([{
        ...createFlashCardDeckDto,
        created_by: new Types.ObjectId(user._id), // Gán ID người tạo
        is_admin: user.role === UserRole.ADMIN, // Đánh dấu nếu do admin tạo
        flashcards: createFlashCardDeckDto.flashcards || [], // Thêm flashcards nếu có
      }], { session });

      if (!createdDeck[0]) {
        throw new Error('Không thể tạo bộ thẻ');
      }

      await this.userFlashcardService.create(createdDeck[0], user, session);

      await session.commitTransaction();
      return createdDeck;

    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll() {
    return await this.flashCardDeckModel.find().lean();
  }

  async findOne(id: string) {
    try {
      const flashCardDeck = await this.flashCardDeckModel.findById(id).lean();
      if (!flashCardDeck) {
        throw new NotFoundException("Không tìm thấy bộ thẻ");
      }
      return flashCardDeck;
    } catch (error) {
      console.error('Error finding flashcard deck:', error);
      throw error;
    }
  }

  async update(id: string, updateFlashCardDeckDto: UpdateFlashCardDeckDto, user: JwtPayload) {
    try {

      const filter: any = { _id: new Types.ObjectId(id) };

      if (user.role !== UserRole.ADMIN) {
        filter.created_by = new Types.ObjectId(user._id);
      }
      const updatedDeck = await this.flashCardDeckModel.findOneAndUpdate(
        filter,
        { $set: { ...updateFlashCardDeckDto } },
        { new: true },
      );
      if (!updatedDeck) {
        throw new NotFoundException("Không thể cập nhật bộ thẻ");
      }
      return updatedDeck;
    } catch (error) {
      console.error('Error updating flashcard deck:', error);
      throw error;
    }
  }

  async updateFlashcard(id: string, flashcard: UpdateFlashCardDto, user: JwtPayload) {
    try {
      const filter: any = {
        _id: new Types.ObjectId(id),
        'flashcards._id': new Types.ObjectId(flashcard._id)
      };

      if (user.role !== UserRole.ADMIN) {
        filter.created_by = new Types.ObjectId(user._id);
      }

      const updatedDeck = await this.flashCardDeckModel.findOneAndUpdate(
        filter,
        {
          $set: {
            "flashcards.$.text": flashcard.text,
            "flashcards.$.meaning": flashcard.meaning,
            "flashcards.$.examples": flashcard.examples,
            "flashcards.$.image_url": flashcard.image_url,
            "flashcards.$.transliteration": flashcard.transliteration,
            "flashcards.$.type": flashcard.type,
          }
        },
        { new: true },
      );
      if (!updatedDeck) {
        throw new NotFoundException("Không thể cập nhật flashcard");
      }
      return updatedDeck;
    } catch (error) {
      console.error('Error updating flashcards:', error);
      throw error;
    }
  }

  async createFlashcard(id: string, flashcard: CreateFlashcardDto, user: JwtPayload) {
    try {
      const filter: any = { _id: new Types.ObjectId(id) };

      if (user.role !== UserRole.ADMIN) {
        filter.created_by = new Types.ObjectId(user._id);
      }
      const updatedDeck = await this.flashCardDeckModel.findOneAndUpdate(
        filter, {
        $push: { flashcards: flashcard }
      }, { new: true },
      );
      if (!updatedDeck) {
        throw new NotFoundException("Không thể tạo flashcard");
      }
      return updatedDeck;

    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  }

  async deleteFlashcard(deckId: string, flashcardId: string, user: JwtPayload) {
    try {
      const filter: any = { _id: new Types.ObjectId(deckId) };

      if (user.role !== UserRole.ADMIN) {
        filter.created_by = new Types.ObjectId(user._id);
      }

      const updatedDeck = await this.flashCardDeckModel.findOneAndUpdate(
        filter,
        { $pull: { flashcards: { _id: new Types.ObjectId(flashcardId) } } },
        { new: true }
      );

      if (!updatedDeck) {
        throw new NotFoundException("Không thể xóa flashcard");
      }

      return updatedDeck;

    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  }

  async remove(id: string) {
    return `This action removes a #${id} flashCardDeck`;
  }
}

