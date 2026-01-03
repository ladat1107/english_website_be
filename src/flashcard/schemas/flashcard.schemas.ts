import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type FlashcardDocument = HydratedDocument<Flashcard>;

/**
 * Schema cho từng thẻ Flashcard
 * - Mỗi thẻ thuộc về 1 deck cụ thể
 * - Chứa nội dung mặt trước (câu hỏi/từ) và mặt sau (đáp án/nghĩa)
 * - Hỗ trợ text, hình ảnh, và audio cho cả 2 mặt
 */

// Sub-schema cho nội dung của mặt thẻ
@Schema({ _id: false })
class CardSide {
    // Văn bản chính (bắt buộc)
    @Prop({ required: true, trim: true })
    text: string;

    @Prop({ default: '', trim: true })
    transliteration: string; // Phiên âm (nếu có)

    // URL hình ảnh minh họa (tùy chọn)
    @Prop({ default: null })
    image_url: string;

    // URL file âm thanh phát âm (tùy chọn)
    @Prop({ default: null })
    audio_url: string;
}

// Sub-schema cho mặt sau (có thêm ví dụ và ghi chú)
@Schema({ _id: false })
class BackSide extends CardSide {

    // Các câu ví dụ sử dụng từ
    @Prop({ type: [String], default: [] })
    examples: string[];

    // Ghi chú thêm (ngữ pháp, cách dùng...)
    @Prop({ default: '', trim: true })
    notes: string;
}

@Schema({ timestamps: true })
export class Flashcard {
    // ID của deck mà thẻ này thuộc về
    @Prop({ required: true, type: Types.ObjectId, ref: 'FlashCardDeck', index: true })
    deck_id: Types.ObjectId;

    // Mặt trước của thẻ (câu hỏi/từ vựng)
    @Prop({ required: true, type: CardSide })
    front: CardSide;

    // Mặt sau của thẻ (đáp án/nghĩa)
    @Prop({ required: true, type: BackSide })
    back: BackSide;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

// Tạo index để query nhanh các thẻ của 1 deck
FlashcardSchema.index({ deck_id: 1, order: 1 });
