import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type UserAnswerDocument = HydratedDocument<UserAnswer>;
@Schema({ timestamps: true })
export class UserAnswer {

    @Prop({ type: Types.ObjectId, ref: 'ExamAttempt', required: true })
    exam_attempt_id: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
    question_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    user_id: Types.ObjectId;

    @Prop({ type: [String], default: [] })
    selected_answer: string[];

    @Prop({ type: String, default: null })
    text_answer: string;

    @Prop({ type: String, default: null })
    record_answer: string;

    @Prop({ type: Boolean, default: false })
    is_correct: boolean;

    @Prop({ type: Boolean, default: false })
    is_flagged: boolean;
}

export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);
