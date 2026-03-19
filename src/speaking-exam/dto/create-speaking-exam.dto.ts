import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, ValidateNested } from "class-validator";
import { CreateSpeakingQuestionDto } from "./speaking-question";
import { Type } from "class-transformer";
import { LevelExam, SpeakingTopic, TypeLanguage } from "@/utils/constants/enum";
import { CreateVideoScriptDto } from "./video-script";

export class CreateVocabularyDto {
    @IsNotEmpty({ message: "Từ vựng không được để trống" })
    @IsString()
    vocabulary: string;

    @IsNotEmpty({ message: "Nghĩa không được để trống" })
    @IsString()
    meaning: string;

    // Loại từ (danh từ, động từ, tính từ, v.v.)
    @IsOptional()
    @IsString()
    type?: string;
}

export class CreateOptionDto {
    @IsNotEmpty({ message: "Key không được để trống" })
    @IsString()
    key: string;

    @IsNotEmpty({ message: "Text không được để trống" })
    @IsString()
    text: string;
}

export class CreateMutipleChoiceQuestionDto {
    @IsNotEmpty({ message: "Số thứ tự câu hỏi không được để trống" })
    @IsNumber()
    question_number: number;

    @IsNotEmpty({ message: "Nội dung câu hỏi không được để trống" })
    @IsString()
    question_text: string;

    @IsNotEmpty({ message: "Các lựa chọn không được để trống" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOptionDto)
    options: CreateOptionDto[];

    @IsNotEmpty({ message: "Lựa chọn đúng không được để trống" })
    @IsString()
    correct_option: string;
}
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

    @IsNotEmpty({ message: "Cấp độ không được để trống" })
    @IsEnum(LevelExam, { message: "Cấp độ không hợp lệ" })
    level: LevelExam;

    @IsNotEmpty({ message: "Ngôn ngữ không được để trống" })
    @IsEnum(TypeLanguage, { message: "Ngôn ngữ không hợp lệ" })
    type: TypeLanguage

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

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateVocabularyDto)
    vocabularies?: CreateVocabularyDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMutipleChoiceQuestionDto)
    multiple_choice_questions?: CreateMutipleChoiceQuestionDto[];
}
