import { Vocabulary, VocabularySchema } from "@/speaking-exam/schemas/speaking-exam.schemas";
import { LevelExam, TypeLanguage } from "@/utils/constants/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WritingExamDocument = HydratedDocument<WritingExam>;

@Schema({ timestamps: true })
export class WritingExam {
    @Prop({ required: true, type: String })
    title: string;

    @Prop({ required: true, type: String })
    content: string;

    // Mảng nhiều hình ảnh cho câu hỏi
    @Prop({ required: false, type: [String], default: [] })
    images: string[];

    @Prop({ required: false, type: String, default: '' })
    suggest: string;

    @Prop({ required: true, type: String, enum: TypeLanguage })
    type: TypeLanguage;

    @Prop({ required: true, type: String, enum: LevelExam })
    level: LevelExam;

    @Prop({ required: true, type: Boolean, default: false })
    is_published: boolean;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    created_by: Types.ObjectId;

    @Prop({ type: [VocabularySchema], default: [] })
    vocabularies: Vocabulary[];
}

export const WritingExamSchema = SchemaFactory.createForClass(WritingExam);
