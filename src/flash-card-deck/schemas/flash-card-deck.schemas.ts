import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type FlashCardDeckDocument = HydratedDocument<FlashCardDeck>;

/**
 * Schema cho Bộ thẻ Flashcard
 * - Admin có thể tạo deck công khai (is_public = true) cho tất cả user sử dụng
 * - User có thể tạo deck riêng (is_public = false, created_by = user_id)
 * - User có thể copy deck công khai về để học (dùng UserFlashCardProgress để track)
 */
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
    icon: string;

    // Deck công khai (admin tạo) hay riêng tư (user tạo)
    // true: mọi người đều thấy và có thể học
    // false: chỉ người tạo mới thấy
    @Prop({ default: false })
    is_public: boolean;

    // Category/chủ đề của deck (vd: 'TOEIC', 'IELTS', 'Business English', 'Daily Conversation')
    @Prop({ default: 'General', trim: true })
    category: string;

    // Cấp độ (Beginner, Intermediate, Advanced)
    @Prop({ default: 'Beginner', trim: true })
    level: string;

    // Tổng số thẻ trong deck (sẽ được cập nhật khi thêm/xóa flashcard)
    @Prop({ default: 0, min: 0 })
    total_cards: number;

    // Số lượng user đã học deck này (chỉ áp dụng cho public deck)
    @Prop({ default: 0, min: 0 })
    total_learners: number;

}

export const FlashCardDeckSchema = SchemaFactory.createForClass(FlashCardDeck);

