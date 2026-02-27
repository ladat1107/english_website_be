import { IsMongoId } from "class-validator";

export class CreateSpeakingAttemptDto {
    @IsMongoId()
    exam_id: string;
}
