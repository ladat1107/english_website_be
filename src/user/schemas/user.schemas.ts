import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ExamType, ProficiencyLevel, SkillEnum, UserRole } from 'src/utils/constants/enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // tự động thêm createdAt và updatedAt
export class User {

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    full_name: string;

    @Prop({ default: null })
    avatar_url: string;

    @Prop({
        type: String,
        enum: UserRole,
        default: UserRole.STUDENT
    })
    role: string;

    @Prop({
        type: String,
        enum: ExamType,
        default: null,
        required: false,
    })
    target_exam: string;

    @Prop({ type: Number, default: null, required: false, min: 0, max: 990 })
    target_score: number;

    @Prop({
        type: String,
        enum: ProficiencyLevel,
        default: ProficiencyLevel.BEGINNER
    })
    current_level: string;

    @Prop({ type: Date, default: null, required: false })
    target_date: Date;

    @Prop({
        type: [String],
        enum: SkillEnum,
        default: []
    })
    learning_goals: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }); // Tạo index trên trường email để tăng tốc độ truy vấn
UserSchema.index({ role: 1 }); // Tạo index trên trường role để tăng tốc độ truy vấn
