import { AIAnalysis, AIAnalysisSchema } from "@/speaking-answer/schemas/speaking-answer.schemas";
import { ExamAttemptStatus } from "@/utils/constants/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ _id: false })
class FileInfo {
    @Prop({ type: String })
    name: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: false })
    size?: number;

    @Prop({ required: false })
    type?: string;
}

export const FileInfoSchema = SchemaFactory.createForClass(FileInfo);

export type WritingAnswerDocument = HydratedDocument<WritingAnswer>;

@Schema({ timestamps: true })
export class WritingAnswer {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    user_id: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'WritingExam' })
    writing_exam_id: Types.ObjectId;

    @Prop({ type: String })
    answer: string; // nội dung bài viết của học viên

    @Prop({ type: [FileInfoSchema], default: [] })
    files: FileInfo[]; // link ảnh, file bài viết (hỗ trợ nhiều file)

    @Prop({ type: Boolean, default: false })
    is_pinned: boolean;

    @Prop({ type: Number, min: 0, max: 100, default: 0 })
    score: number; // điểm do giáo viên chấm hoặc AI chấm

    @Prop({ type: String, default: '' })
    teacher_feedback: string; // phản hồi của giáo viên

    @Prop({ required: false, type: Date, default: null })
    submitted_at: Date;

    @Prop({ type: AIAnalysisSchema, default: null })
    ai_analysis: AIAnalysis;
}

export const WritingAnswerSchema = SchemaFactory.createForClass(WritingAnswer);
