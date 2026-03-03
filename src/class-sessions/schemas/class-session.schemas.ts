import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type ClassSessionDocument = HydratedDocument<ClassSession>;

@Schema({ timestamps: true })
export class ClassSession {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    mentor_id: Types.ObjectId;

    @Prop({ required: true, type: String })
    title: string;

    @Prop({ type: String, default: null })
    description: string;

    @Prop({ type: String, required: true })
    link: string;

    @Prop({ required: true, type: Date })
    date: Date;

    @Prop({ required: true })
    startTime: string;  // 20:30

    @Prop({ required: true })
    endTime: string; // 21:30

    @Prop({ default: true })
    is_active: boolean
}

export const ClassSessionSchema = SchemaFactory.createForClass(ClassSession);

ClassSessionSchema.index({ mentor_id: 1 }); 
