import { Type } from "class-transformer";
import { IsNumber, IsObject, IsOptional, IsString, IsUrl, Min, ValidateNested } from "class-validator";
import { CreateQuestionSnapshotDto } from "./create-question-snapshot.dto";
import { AIAnalysisDto } from "./ai-analysis.dto";

export class CreateSpeakingAnswerDto {

    @IsObject()
    @ValidateNested()
    @Type(() => CreateQuestionSnapshotDto)
    question: CreateQuestionSnapshotDto;

    @IsUrl()
    audio_url: string; // file user nói

    @IsNumber()
    @Min(0)
    duration_seconds: number; // độ dài file nói

    // @IsOptional()
    // @IsString()
    // teacher_feedback: string; // phản hồi của giáo viên

    // @IsOptional()
    // @IsNumber()
    // @Min(0)
    // score: number; // điểm do giáo viên chấm hoặc AI chấm

    // @IsOptional()
    // @IsObject()
    // @ValidateNested()
    // @Type(() => AIAnalysisDto)
    // ai_analysis: AIAnalysisDto;
}
