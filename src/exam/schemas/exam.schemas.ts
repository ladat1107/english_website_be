import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ExamType } from "src/utils/constants/enum";

export type ExamDocument = HydratedDocument<Exam>;  // Tạo kiểu tài liệu Mongoose cho Exam => ExamDocument có thể sử dụng hàm của Mongoose như .save(), .update(), v.v.

@Schema({ _id: false }) // Không tự động tạo _id cho subdocument
export class ExamStats {
    @Prop({ type: Number, default: 0, min: 0 })
    total_attempts: number;  // Tổng số lần làm bài

    @Prop({ type: Number, default: 0, min: 0 })
    average_score: number;  // Điểm trung bình

    @Prop({ type: Number, default: 0, min: 0 })
    completion_rate: number;
}

const ExamStatsSchema = SchemaFactory.createForClass(ExamStats);

@Schema({ timestamps: true })
export class Exam {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({
        type: String,
        enum: ExamType,
        required: true
    })
    exam_type: string;

    @Prop({ type: String, default: null })
    description: string;

    @Prop({ type: Number, required: true, min: 1 })
    total_duration_minutes: number;

    @Prop({ type: ExamStatsSchema, default: () => ({}) })
    stats: ExamStats;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    created_by: Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

ExamSchema.index({ created_by: 1 }); // Tạo index trên trường created_by để tăng tốc độ truy vấn
