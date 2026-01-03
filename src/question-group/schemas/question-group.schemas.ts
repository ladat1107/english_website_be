import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { QuestionGroupType } from "src/utils/constants/enum";


export type QuestionGroupDocument = HydratedDocument<QuestionGroup>;

@Schema({ _id: false }) // Không tự động tạo _id cho subdocument
export class SharedContent {
    // For reading passages
    @Prop({ required: false, default: null })
    passage_text: String
    @Prop({ required: false, default: null })
    passage_title: String

    // For listening (conversations, talks)
    @Prop({ required: false, default: null })
    audio_url: String
    @Prop({ required: false, default: null })
    audio_duration_seconds: Number
    @Prop({ required: false, default: null })
    transcript: String // hidden initially

    // For image-based questions (TOEIC Part 1)
    @Prop({ required: false, default: null })
    image_url: String
    @Prop({ required: false, default: null })
    image_description: String // for accessibility

    // For multiple questions sharing context
    @Prop({ required: false, default: null })
    context: String
}
const SharedContentSchema = SchemaFactory.createForClass(SharedContent);

@Schema({ timestamps: true })
export class QuestionGroup {


    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    exam_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
    section_id: Types.ObjectId;

    @Prop({
        required: true,
        type: String,
        enum: QuestionGroupType,
    })
    group_type: string;

    @Prop({ type: SharedContentSchema, required: false, default: () => ({}) })
    shared_content: SharedContent;
}

export const QuestionGroupSchema = SchemaFactory.createForClass(QuestionGroup);
