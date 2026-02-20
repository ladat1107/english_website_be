import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, ValidateNested } from "class-validator";
import { CreateSpeakingQuestionDto } from "./speaking-question";
import { Type } from "class-transformer";
import { SpeakingTopic } from "@/utils/constants/enum";
import { CreateVideoScriptDto } from "./video-script";

export class CreateSpeakingExamDto {

    @IsNotEmpty({ message: "Tiêu đề không được để trống" })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: "Mô tả không được vượt quá 1000 ký tự" })
    description?: string;

    @IsNotEmpty({ message: "Link video không được để trống" })
    @IsUrl()
    video_url: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsEnum(SpeakingTopic, { message: "Chủ đề không hợp lệ" })
    topic: SpeakingTopic;

    @IsNumber()
    @Min(1, { message: "Thời lượng ước tính phải lớn hơn 0" })
    estimated_duration_minutes: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSpeakingQuestionDto)
    questions?: CreateSpeakingQuestionDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateVideoScriptDto)
    video_scripts?: CreateVideoScriptDto[];
}
