import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFlashCardDeckDto, CreateFlashcardDto } from './dto/create-flash-card-deck.dto';
import { UpdateFlashCardDeckDto, UpdateFlashCardDto } from './dto/update-flash-card-deck.dto';
import { JwtPayload } from '@/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { FlashCardDeck, FlashCardDeckDocument } from './schemas/flash-card-deck.schemas';
import { Model, Types } from 'mongoose';
import { UserRole } from '@/utils/constants/enum';
import { UserFlashcardService } from '@/user-flashcard/user-flashcard.service';
import { AIAnalysisService } from '@/groq/ai-analysis.service';
import { QueryFlashCardDeckDto } from './dto/query-flash-card-desk.dto';
import { buildVietnameseRegex } from '@/utils/functions/function';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';

@Injectable()
export class FlashCardDeckService {
  constructor(
    @InjectModel(FlashCardDeck.name)
    private readonly flashCardDeckModel: Model<FlashCardDeckDocument>,
    private userFlashcardService: UserFlashcardService,
    private aIAnalysisService: AIAnalysisService
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
      return createdDeck[0];

    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(query: QueryFlashCardDeckDto) {
    try {
      const { page = 1, limit = 10, topic, type, search, is_admin } = query;
      const matchStage: any = {};

      if (topic) { matchStage.topic = topic; }

      if (type) { matchStage.type = type; }

      if (is_admin !== undefined) { matchStage.is_admin = is_admin; }

      const buildSearch = search ? buildVietnameseRegex(search) : null;
      const searchStage = buildSearch ? {
        $or: [
          { title: { $regex: buildSearch, $options: 'i' } },
          { description: { $regex: buildSearch, $options: 'i' } },
          { 'author.full_name': { $regex: buildSearch, $options: 'i' } },
          { 'author.email': { $regex: buildSearch, $options: 'i' } },
        ]
      } : {};

      const pipeline: any = [{
        $match: matchStage
      }, {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: { _id: 1, email: 1, full_name: 1, avatar_url: 1, phone: 1, }
            }
          ]
        },
      }, {
        $unwind: '$author'
      },
      ...[{ $match: searchStage }],
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: calculateSkip(page, limit) }, { $limit: limit }]
        }
      }, {
        $unwind: {
          path: "$metadata",
          preserveNullAndEmptyArrays: true
        }
      }, {
        $project: {
          total: "$metadata.total",
          data: 1,
        }
      }]

      const result = await this.flashCardDeckModel.aggregate(pipeline);

      if (!result || result.length === 0) {
        return createPaginatedResponse([], 0, page, limit);
      }

      return createPaginatedResponse(result[0].data, result[0].total, page, limit);

    } catch (error) {
      console.error('Error finding flashcard decks:', error);
      throw error;
    }
  }

  async findAllForClient(query: QueryFlashCardDeckDto, user?: JwtPayload) {
    try {
      const { page = 1, limit = 10, search, topic, type } = query;

      const userId = user ? new Types.ObjectId(user._id) : null;

      const matchStage: any = {};

      if (topic) matchStage.topic = topic;

      if (type) matchStage.type = type;

      const buildSearch = search ? buildVietnameseRegex(search) : null;

      if (buildSearch) {
        matchStage.$or = [
          { title: { $regex: buildSearch, $options: 'i' } },
          { description: { $regex: buildSearch, $options: 'i' } }
        ];
      }

      const pipeline: any = [

        { $match: matchStage }, // B1: lọc flashcarddecks theo admin + topic + type + search

        {
          $lookup: {
            from: 'userflashcards', // join sang collection user_flashcards
            let: { deckId: '$_id' }, // truyền _id của deck hiện tại vào biến deckId
            pipeline: [
              {
                $match: {
                  $expr: {  // sử dụng $expr để truy cập biến deckId và userId trong pipeline
                    $and: [
                      { $eq: ['$deck_id', '$$deckId'] }, // deck_id phải trùng với deckId của flashcarddeck
                      { $eq: ['$user_id', userId] } // user_id phải trùng với user hiện tại
                    ]
                  }
                }
              }
            ],
            as: 'userFlashcard' // kết quả lookup sẽ nằm trong field user_flashcard (array)
          }
        }, {
          $unwind: {
            path: '$userFlashcard', // biến array user_flashcard thành object
            preserveNullAndEmptyArrays: true // nếu user chưa có deck thì vẫn giữ record và set user_flashcard = null
          }
        },
        // B3: nếu có user thì hiển thị cả deck admin và deck của user, không có user thì chỉ hiện admin
        ...(userId
          ? [{
            $match: {
              $or: [
                { is_admin: true },
                { 'userFlashcard.user_id': userId }
              ]
            }
          }]
          : [{
            $match: { is_admin: true }
          }]
        ),
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              {
                $project: { _id: 1, email: 1, full_name: 1, avatar_url: 1, phone: 1, }
              }
            ]
          }
        },
        { $unwind: '$author' },

        { $sort: { title: 1 } }, // B4: sắp xếp deck theo title tăng dần

        {
          $facet: {
            metadata: [
              { $count: 'total' } // đếm tổng số record để dùng cho pagination
            ],
            data: [
              { $skip: calculateSkip(page, limit) }, // bỏ qua các record của page trước
              { $limit: limit } // lấy số record theo limit
            ]
          }
        },
        {
          $unwind: {
            path: '$metadata', // chuyển metadata từ array sang object
            preserveNullAndEmptyArrays: true // nếu không có dữ liệu vẫn không bị lỗi
          }
        }

      ];

      const result = await this.flashCardDeckModel.aggregate(pipeline); // chạy aggregate pipeline

      if (!result || result.length === 0) { // nếu không có dữ liệu
        return createPaginatedResponse([], 0, page, limit); // trả về response rỗng
      }

      return createPaginatedResponse(result[0].data, result[0]?.metadata?.total || 0, page, limit);

    } catch (error) {
      console.error('Error fetching flashcard deck results:', error); // log lỗi nếu có
      throw error; // ném lỗi ra ngoài
    }

  }

  /** Lấy thông tin deck công khai - không cần auth, cho SSR metadata */
  async findOnePublic(id: string) {
    try {
      const deck = await this.flashCardDeckModel.findById(id)
        .select('title description image topic type flashcards is_admin created_by createdAt')
        .lean();

      if (!deck) {
        throw new NotFoundException("Không tìm thấy bộ thẻ");
      }

      return {
        ...deck,
        flashcardsCount: deck.flashcards?.length || 0,
      };
    } catch (error) {
      console.error('Error finding public flashcard deck:', error);
      throw error;
    }
  }

  async findOne(id: string, user: JwtPayload) {
    try {
      const userId = new Types.ObjectId(user._id);
      const pipeline: any = [{
        $match: { _id: new Types.ObjectId(id) }
      }, {
        $lookup: {
          from: 'userflashcards',
          let: { deckId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$deck_id', '$$deckId'] },
                    { $eq: ['$user_id', userId] }
                  ]
                }
              }
            }
          ],
          as: 'userFlashcard' // Đổi từ plural sang singular để khớp với frontend
        },
      }, {
        $unwind: {
          path: '$userFlashcard',
          preserveNullAndEmptyArrays: true
        }
      }]
      const flashCardDeck = await this.flashCardDeckModel.aggregate(pipeline);

      if (!flashCardDeck || flashCardDeck.length === 0) {
        throw new NotFoundException("Không tìm thấy bộ thẻ");
      }

      // Nếu user chưa có record userFlashcard, tự động tạo (trừ admin)
      if (!flashCardDeck[0].userFlashcard && user.role !== UserRole.ADMIN) {
        const userFlashcard = await this.userFlashcardService.create(flashCardDeck[0], user);
        flashCardDeck[0].userFlashcard = userFlashcard;
      }

      return flashCardDeck[0];
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

      console.log('Deleted flashcard. Updated deck:', updatedDeck);
      return updatedDeck;

    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  }

  async remove(id: string, user: JwtPayload) {
    const session = await this.flashCardDeckModel.db.startSession();
    session.startTransaction();
    try {
      const filter: any = { _id: new Types.ObjectId(id) };

      const removedDeck = await this.flashCardDeckModel.findOne(filter);
      if (!removedDeck) {
        throw new NotFoundException("Không thể xóa bộ thẻ");
      }

      if (user.role === UserRole.ADMIN || user._id === removedDeck.created_by.toString()) {
        await this.userFlashcardService.remove(removedDeck._id.toString(), null, session);
        await removedDeck.deleteOne({ session });
      } else if (user._id !== removedDeck.created_by.toString()) {
        await this.userFlashcardService.remove(removedDeck._id.toString(), user._id, session);
      }
      await session.commitTransaction();

      return removedDeck;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error removing flashcard deck:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async generateFlashcard(word: string): Promise<CreateFlashcardDto> {
    try {
      const promtAI = `You are a flashcard dictionary generator.

Return ONLY a valid JSON object with exactly these fields:
{ "text", "transliteration", "type", "meaning", "examples" }

Language detection:
- Contains Chinese characters → Chinese
- Otherwise → English

Part of speech (type):
- English: noun, verb, adj, adv, pron, num, conj, prep, int
- Chinese: 名, 动, 形, 副, 代, 数, 量, 连, 介, 叹

Rules:
- transliteration: English → IPA; Chinese → pinyin.
- meaning: must be in Vietnamese, concise, max 6 words.
- examples:
  - multiple lines, separated by "\n"
  - English word → must be in English sentences or grammar notes (specify the meaning of the word in that sentence)
  - Chinese word → must be in Chinese sentences or grammar notes (specify the meaning of the word in that sentence)

Strict formatting:
- Output JSON only
- No comments, no explanation, no markdown, no extra fields
- No surrounding text
- Ensure JSON is parseable`;

      const completion = await this.aIAnalysisService.generateFlashcard(word, promtAI);

      return completion;
    } catch (error) {
      console.error('Error generating flashcard:', error);
      return {
        text: word,
        meaning: "Nghĩa của từ",
      };
    }
  }
}

