import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { QuestionGroupType } from "src/utils/constants/enum";

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ _id: false })
class StastQuestion {
    @Prop({ type: Number, default: 0, min: 0 })
    total_attempts: number;  // Tổng số lần trả lời câu hỏi

    @Prop({ type: Number, default: 0, min: 0 })
    correct_attempts: number;  // Số lần trả lời đúng

    @Prop({ type: Number, default: 0, min: 0 })
    accuracy_rate: number;  // Tỷ lệ trả lời đúng (%)

    @Prop({ type: Number, default: 0, min: 0 })
    average_time_seconds: number;  // Thời gian trung bình trả lời câu hỏi (giây)

    @Prop({ type: String, default: null })
    most_common_wrong_answer: string;  // Đáp án sai phổ biến nhất
}

@Schema({ _id: false })
class Vocabulary {
    @Prop({ required: true, type: String })
    word: string;

    @Prop({ required: false, default: null })
    meaning: string;

    @Prop({ required: false, default: null })
    example: string;
}

const VocabularySchema = SchemaFactory.createForClass(Vocabulary);

@Schema({ _id: false })
class Explanation {
    @Prop({ required: true, type: String })
    text: string;

    @Prop({ required: false, default: null })
    translation: string;

    @Prop({ type: [VocabularySchema], required: false, default: () => [] })
    vocabularly: Vocabulary[];

    @Prop({ required: false, default: null })
    video_explanation_url: string;
}

const ExplanationSchema = SchemaFactory.createForClass(Explanation);


@Schema({ _id: true })
export class AnswerOption {
    @Prop({ required: true })
    key: string;  // 'A', 'B', 'C', 'D', etc.
    @Prop({ required: true })
    text: string; // Nội dung đáp án
    @Prop({ required: false, default: null })
    image_url: string; // URL hình ảnh đáp án (nếu có)
}

const AnswerOptionSchema = SchemaFactory.createForClass(AnswerOption);


@Schema({ timestamps: true })
export class Question {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    exam_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
    section_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'QuestionGroup', required: true })
    question_group_id: Types.ObjectId;

    @Prop({ required: false, default: null })
    question_number: number;

    @Prop({
        required: true,
        type: String,
        enum: QuestionGroupType
    })
    question_type: String;

    @Prop({ required: true })
    question_text: string;

    @Prop({ required: false, default: null })
    question_audio_url: String;

    @Prop({ required: false, default: null })
    question_image_url: String;

    @Prop({ type: [AnswerOptionSchema], required: true })
    options: AnswerOption[];

    @Prop({ required: true })
    correct_answers: string[];  // Mảng các key của đáp án đúng ['A'], ['B', 'C'], etc.

    @Prop({ required: false, default: null })
    correct_answer_text: string; // Giải thích đáp án đúng

    @Prop({ type: ExplanationSchema, required: false, default: () => ({}) })
    explanation: Explanation;

    @Prop({ required: true, min: 0, default: 1 })
    point: number;

}

export const QuestionSchema = SchemaFactory.createForClass(Question);
