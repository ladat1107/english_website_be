import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateParticipantDto {
    @IsNotEmpty()
    @IsMongoId()
    class_session_id: string;
}
