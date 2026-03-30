import { CreateVocabularyDto } from "@/speaking-exam/dto/create-speaking-exam.dto";
import { LevelExam, TypeLanguage } from "@/utils/constants/enum";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

export class CreateWritingExamDto {
    @IsNotEmpty({ message: "Tiêu đề không được để trống" })
    @IsString()
    title: string;

    @IsNotEmpty({ message: "Nội dung đề bài không được để trống" })
    @IsString()
    @MaxLength(10000, { message: "Nội dung đề bài không được vượt quá 10000 ký tự" })
    content: string; // trên giao diện là textarea, cho phép lưu xuống dòng, gạch đầu dòng, v.v.

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: "Nội dung gợi ý không được vượt quá 1000 ký tự" })
    suggest: string; // trên giao diện là textarea, cho phép lưu xuống dòng, gạch đầu dòng, v.v.

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[]; // bỏ qua không để vào postman

    @IsNotEmpty({ message: "Ngôn ngữ không được để trống" })
    @IsEnum(TypeLanguage, { message: "Ngôn ngữ không hợp lệ" })
    type: TypeLanguage;

    @IsNotEmpty({ message: "Cấp độ không được để trống" })
    @IsEnum(LevelExam, { message: "Cấp độ không hợp lệ" })
    level: LevelExam;

    @IsOptional()
    @IsBoolean()
    is_published?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateVocabularyDto)
    vocabularies?: CreateVocabularyDto[];
}

// export class CreateVocabularyDto {
//     @IsNotEmpty({ message: "Từ vựng không được để trống" })
//     @IsString()
//     vocabulary: string;

//     @IsNotEmpty({ message: "Nghĩa không được để trống" })
//     @IsString()
//     meaning: string;

//     // từ loại Parts of Speech (verb, noun, adjective, adverb, preposition, conjunction, interjection) hoặc Chinese parts of speech
//     @IsOptional()
//     @IsString()
//     type?: string;
// }

// export enum LevelExam {
//     EASY = 'Easy',
//     MEDIUM = 'Medium',
//     HARD = 'Hard',
// }

// export enum TypeLanguage {
//     ENGLISH = 'English',
//     CHINESE = 'Chinese',
// }



