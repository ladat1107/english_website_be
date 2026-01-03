import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserFlashcardDocument = HydratedDocument<UserFlashcard>;

/**
 * Schema tracking kết quả học Flashcard của User
 * - Mỗi user học 1 deck sẽ có 1 document này
 * - Chỉ lưu kết quả gần nhất (không lưu lịch sử)
 * - Hiển thị thống kê: bao nhiêu từ đúng/sai
 */

// Sub-schema cho kết quả của từng thẻ
@Schema({ _id: false })
class CardResult {
    // ID của flashcard
    @Prop({ required: true, type: Types.ObjectId, ref: 'Flashcard' })
    card_id: Types.ObjectId;

    // Kết quả lần gần nhất: true = đúng, false = sai
    @Prop({ required: true })
    is_correct: boolean;

    // Thời điểm trả lời lần gần nhất
    @Prop({ default: Date.now })
    last_answered_at: Date;
}

@Schema({ timestamps: true })
export class UserFlashcard {
    // ID của user
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    user_id: Types.ObjectId;

    // ID của deck đang học
    @Prop({ required: true, type: Types.ObjectId, ref: 'FlashCardDeck', index: true })
    deck_id: Types.ObjectId;

    // Tổng số thẻ trong deck
    @Prop({ default: 0, min: 0 })
    total_cards: number;

    // Số thẻ trả lời đúng (lần gần nhất)
    @Prop({ default: 0, min: 0 })
    correct_cards: number;

    // Số thẻ trả lời sai (lần gần nhất)
    @Prop({ default: 0, min: 0 })
    incorrect_cards: number;

    // Lần học gần nhất
    @Prop({ default: null })
    last_studied_at: Date;

    // Chi tiết kết quả từng thẻ (chỉ lưu kết quả gần nhất)
    @Prop({ type: [CardResult], default: [] })
    cards_result: CardResult[];
}

export const UserFlashcardSchema = SchemaFactory.createForClass(UserFlashcard);

// Tạo compound index để đảm bảo mỗi user chỉ có 1 doc cho mỗi deck
UserFlashcardSchema.index({ user_id: 1, deck_id: 1 }, { unique: true });
