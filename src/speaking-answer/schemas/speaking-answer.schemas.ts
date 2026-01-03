import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ _id: false })
class QuestionSnapshot {
    @Prop({ type: Number, required: true })
    question_number: number;

    @Prop({ type: String, required: true })
    question_text: string;
}

const QuestionSnapshotSchema = SchemaFactory.createForClass(QuestionSnapshot);


@Schema({ _id: false })
class AIAnalysis {
    @Prop({ type: String })
    transcript: string; // speech-to-text result
    @Prop({ type: [String] })
    improvement: string[]; // gợi ý cải thiện
    @Prop({ type: [String] })
    error: string[]; // lỗi sai trong bài nói
    @Prop({ type: String })
    ai_fix: string; // đoạn text AI sửa lại
}

const AIAnalysisSchema = SchemaFactory.createForClass(AIAnalysis);

export type SpeakingAnswerDocument = HydratedDocument<SpeakingAnswer>;

@Schema({ timestamps: true })
export class SpeakingAnswer {
    @Prop({ type: Types.ObjectId, ref: 'SpeakingAttempt', required: true })
    attempt_id: Types.ObjectId;

    // Lưu snapshot câu hỏi thay vì chỉ question_number
    @Prop({ type: QuestionSnapshotSchema, required: true })
    question: QuestionSnapshot;

    @Prop({ type: String })
    audio_url: string; // file user nói

    @Prop({ type: Number, default: 0 })
    duration_seconds: number; // độ dài file nói

    @Prop({ type: String })
    teacher_feedback: string; // phản hồi của giáo viên

    @Prop({ type: Number, min: 0, max: 100, default: 0 })
    score: number; // điểm do giáo viên chấm hoặc AI chấm

    @Prop({ type: AIAnalysisSchema, default: null })
    ai_analysis: AIAnalysis;
}

export const SpeakingAnswerSchema = SchemaFactory.createForClass(SpeakingAnswer);
