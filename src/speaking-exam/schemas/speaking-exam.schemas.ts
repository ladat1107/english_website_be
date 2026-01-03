import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { SpeakingTopic } from "src/utils/constants/enum";


@Schema({ _id: true })
class Question {
    @Prop({ required: true, type: Number })
    question_number: number;

    @Prop({ required: true, type: String })
    question_text: string;

    @Prop({ required: false, type: String })
    suggested_answer: string;
}

const QuestionSchema = SchemaFactory.createForClass(Question);


@Schema({ _id: false })
class VideoScript {
    @Prop({ required: true, type: String })
    speaker: string;

    @Prop({ required: true, type: String })
    content: string;

    @Prop({ required: true, type: String })
    translation: string;
}

const VideoScriptSchema = SchemaFactory.createForClass(VideoScript);



export type SpeakingExamDocument = HydratedDocument<SpeakingExam>;
@Schema({ timestamps: true })
export class SpeakingExam {

    @Prop({ required: true, type: String })
    title: string;

    @Prop({ type: String, default: null, required: false })
    description: string;

    @Prop({ required: true, type: String, enum: SpeakingTopic })
    topic: string;

    @Prop({ required: true, type: Number, min: 1 })
    estimated_duration_minutes: number;

    @Prop({ required: true, type: String })
    video_url: string;

    @Prop({ type: [VideoScriptSchema], default: [] })
    video_script: VideoScript[];

    @Prop({ type: [QuestionSchema], default: [] })
    questions: Question[];

    @Prop({ required: true, type: Boolean, default: false })
    is_published: boolean;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    created_by: Types.ObjectId;
}

export const SpeakingExamSchema = SchemaFactory.createForClass(SpeakingExam);
