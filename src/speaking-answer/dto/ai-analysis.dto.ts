import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AIAnalysisDto {
    @IsString()
    @IsNotEmpty()
    transcript: string; // speech-to-text result

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    improvement: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    error: string[];

    @IsString()
    @IsNotEmpty()
    ai_fix: string; // đoạn text AI sửa lại
}
