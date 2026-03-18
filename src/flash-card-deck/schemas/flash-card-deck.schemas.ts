import { FlashcardTopic, TypeLanguage } from "@/utils/constants/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Flashcard {
    // Văn bản chính (bắt buộc)
    @Prop({ required: true, trim: true })
    text: string;

    @Prop({ default: '', trim: true })
    transliteration: string; // Phiên âm (nếu có)

    //Loại từ (danh từ, động từ, tính từ, v.v.)
    @Prop({ required: false, type: String })
    type: string;

    // URL hình ảnh minh họa (tùy chọn)
    @Prop({ default: null })
    image_url: string;


    //---- Mặt sau của thẻ (có thể có thêm ví dụ, ghi chú...) 
    // Nghĩa của từ/ cụm từ
    @Prop({ required: true, trim: true })
    meaning: string;

    // Các câu ví dụ sử dụng từ
    @Prop({ type: String, default: null })
    examples: string;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

export type FlashCardDeckDocument = HydratedDocument<FlashCardDeck>;

@Schema({ timestamps: true })
export class FlashCardDeck {
    // ID của người tạo deck (admin hoặc user)
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    created_by: Types.ObjectId;

    // Tiêu đề của bộ thẻ
    @Prop({ required: true, trim: true })
    title: string;

    // Mô tả chi tiết về bộ thẻ
    @Prop({ default: '', trim: true })
    description: string;

    // Icon/hình đại diện cho bộ thẻ
    @Prop({ default: null })
    image: string;

    @Prop({ default: FlashcardTopic.BASIC })
    topic: FlashcardTopic;

    @Prop({ default: TypeLanguage.ENGLISH })
    type: TypeLanguage;

    @Prop({ default: false })
    is_admin: boolean; // true = do admin tạo, false = do user tạo

    @Prop({ type: [FlashcardSchema], default: [] })
    flashcards: Flashcard[];
}

export const FlashCardDeckSchema = SchemaFactory.createForClass(FlashCardDeck);

