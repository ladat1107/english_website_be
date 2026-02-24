import { Type } from "class-transformer";
import { IsMongoId, IsNumber, IsObject, IsOptional, IsString, IsUrl, Min, ValidateNested } from "class-validator";
import { CreateQuestionSnapshotDto } from "./create-question-snapshot.dto";
import { AIAnalysisDto } from "./ai-analysis.dto";

export class CreateSpeakingAnswerDto {

    @IsMongoId()
    attempt_id: string;

    @IsObject()
    @ValidateNested()
    @Type(() => CreateQuestionSnapshotDto)
    question: CreateQuestionSnapshotDto;

    @IsUrl()
    audio_url: string; // file user nói

    @IsNumber()
    @Min(0)
    duration_seconds: number; // độ dài file nói
}
