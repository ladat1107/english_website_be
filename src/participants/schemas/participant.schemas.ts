import { RegistrationStatus } from "@/utils/constants/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ParticipantDocument = HydratedDocument<Participant>;

@Schema({ timestamps: true })
export class Participant {
    @Prop({ required: true, type: Types.ObjectId, ref: 'ClassSession', index: true })
    class_session_id: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    user_id: Types.ObjectId;

    @Prop({
        type: String,
        enum: RegistrationStatus,
        default: RegistrationStatus.REGISTERED,
    })
    status: RegistrationStatus;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

ParticipantSchema.index({ class_session_id: 1 });
ParticipantSchema.index({ user_id: 1 }); 
