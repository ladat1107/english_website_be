import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { SkillEnum } from "src/utils/constants/enum";

export type SectionDocument = HydratedDocument<Section>;

@Schema({ timestamps: true })
export class Section {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    exam_id: Types.ObjectId;

    @Prop({ required: true })
    section_number: number;

    @Prop()
    title: string;

    @Prop({ type: String, enum: SkillEnum, required: false, default: null })
    section_type: string;

    @Prop({ required: true })
    part_name: string; // "Part 1", "Part 2", etc.

    @Prop({ required: false, default: null })
    instruction: string;

    @Prop({ required: false, min: 1, default: null })
    duration_minutes: number;

}

export const SectionSchema = SchemaFactory.createForClass(Section);

SectionSchema.index({ exam_id: 1 }); // Tạo index trên trường exam_id để tăng tốc độ truy vấn
