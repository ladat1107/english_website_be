import { IsString, IsOptional, IsNumber, IsArray, Min, IsNotEmpty, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FlashcardTopic, TypeLanguage } from '@/utils/constants/enum';

export class CreateFlashcardDto {
    // Văn bản chính (bắt buộc)
    @IsNotEmpty({ message: 'Vui lòng từ vựng' }) // tiếng việt
    @IsString()
    text: string;

    @IsString()
    @IsOptional()
    transliteration?: string; // Phiên âm (nếu có)

    //Loại từ (danh từ, động từ, tính từ, v.v.)
    @IsString()
    @IsOptional()
    type?: string;

    // URL hình ảnh minh họa (tùy chọn)
    @IsString()
    @IsOptional()
    image_url?: string;

    //---- Mặt sau của thẻ (có thể có thêm ví dụ, ghi chú...) 
    // Nghĩa của từ/ cụm từ
    @IsNotEmpty({ message: 'Vui lòng nhập nghĩa của từ/cụm từ' }) // tiếng việt
    @IsString()
    meaning: string;

    // Các câu ví dụ sử dụng từ
    @IsString()
    @IsOptional()
    examples?: string;
}

export class CreateFlashCardDeckDto {
    @IsNotEmpty({ message: 'Vui lòng nhập tiêu đề' }) // tiếng việt
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString()
    @IsOptional()
    type?: TypeLanguage;

    @IsOptional()
    @IsString()
    topic?: FlashcardTopic;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFlashcardDto)
    flashcards?: CreateFlashcardDto[];
}
