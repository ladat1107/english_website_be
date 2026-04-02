import { BlogCategory } from "@/utils/constants/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog {

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    author: Types.ObjectId;

    @Prop({ required: true })
    image: string;

    @Prop({ required: true, enum: BlogCategory, default: BlogCategory.NEWS })
    category: BlogCategory;

    @Prop({ required: true, default: false })
    is_public: boolean;

    @Prop({ required: true, default: false })
    is_special: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);