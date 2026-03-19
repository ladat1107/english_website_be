import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ExamAttemptStatus } from "src/utils/constants/enum";

@Schema({ _id: false })
export class MultipleChoiceAnswer {
    @Prop({ type: Number, required: true })
    question_number: number;

    @Prop({ type: String, required: true })
    selected_option: string;
}

export const MultipleChoiceAnswerSchema = SchemaFactory.createForClass(MultipleChoiceAnswer);

export type SpeakingAttemptDocument = HydratedDocument<SpeakingAttempt>;
@Schema({ timestamps: true })
export class SpeakingAttempt {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SpeakingExam', required: true })
    exam_id: Types.ObjectId;

    @Prop({
        type: String,
        enum: ExamAttemptStatus,
        default: ExamAttemptStatus.NOT_STARTED,
    })
    status: string;

    @Prop({ type: Date, default: null })
    started_at: Date;

    @Prop({ type: Date, default: null })
    submitted_at: Date;

    @Prop({ type: Boolean, default: false })
    has_teacher_feedback: boolean;

    @Prop({ type: [MultipleChoiceAnswerSchema], default: [] })
    multiple_choice_answers: MultipleChoiceAnswer[];
}

export const SpeakingAttemptSchema = SchemaFactory.createForClass(SpeakingAttempt);
