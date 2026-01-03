import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ExamAttemptStatus } from "src/utils/constants/enum";

@Schema({ _id: false })
class SectionScore {
    @Prop({ type: Types.ObjectId, ref: 'Section' })
    section_id: Types.ObjectId;

    @Prop({ required: true })
    section_name: string;

    @Prop({ type: Number, default: 0, min: 0 })
    score: number;

    @Prop({ type: Number, default: 0 }) // tính bằng giây
    time_spent_seconds: number;
}
const SectionScoreSchema = SchemaFactory.createForClass(SectionScore);

export type ExamAttemptDocument = HydratedDocument<ExamAttempt>;

@Schema({ timestamps: true })
export class ExamAttempt {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Exam' })
    exam_id: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    user_id: Types.ObjectId;

    @Prop({ required: true, type: String, enum: ExamAttemptStatus, default: ExamAttemptStatus.NOT_STARTED })
    status: string;

    @Prop({ type: Date, default: null })
    started_at: Date;

    @Prop({ type: Date, default: null })
    completed_at: Date;

    @Prop({ type: Number, default: 0 }) // tính bằng giây
    time_spent_seconds: number;

    @Prop({ type: Number, default: 0, min: 0 })
    total_score: number;

    @Prop({ type: Number, default: 0, min: 0, max: 100 })
    percentage: number;

    @Prop({ type: [SectionScoreSchema], default: [] })
    section_scores: SectionScore[];

    @Prop({ type: [Types.ObjectId], ref: 'UserAnswer', default: [] })
    answers: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Question', default: [] })
    flagged_questions: Types.ObjectId[];
}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);
