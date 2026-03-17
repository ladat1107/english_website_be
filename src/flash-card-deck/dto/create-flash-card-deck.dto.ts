import { IsString, IsOptional, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FlashcardTopic, TypeLanguage } from '@/utils/constants/enum';

export class CreateFlashcardDto {
    // Văn bản chính (bắt buộc)
    @IsString()
    text: string;

    @IsString()
    @IsOptional()
    transliteration?: string; // Phiên âm (bắt buộc)

    //Loại từ (noun, verb, adj, adv, pron, num, conj, prep, int) hoặc (名, 动, 形, 副, 代, 数, 量, 连, 介, 叹)
    @IsString()
    @IsOptional()
    type?: string;

    // URL hình ảnh minh họa (tùy chọn)
    @IsString()
    @IsOptional()
    image_url?: string;

    // Nghĩa của từ/ cụm từ ngắn gọn (bắt buộc)
    @IsString()
    meaning: string;

    // Các câu ví dụ sử dụng từ, có thể xuống dòng \n
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
    image?: string; // lấy ảnh này https://res.cloudinary.com/dnyodp0rd/image/upload/v1773669365/studying_rmfc63.png

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

// export enum TypeLanguage {
//     ENGLISH = 'English',
//     CHINESE = 'Chinese',
// }

// export enum FlashcardTopic {
//   BASIC = "basic",           // Cơ bản
//   ADVANCED = "advanced",     // Nâng cao
//   TOEIC = "toeic",           // Ôn thi TOEIC
//   IELTS = "ielts",           // Ôn thi IELTS
//   HSK = "hsk",               // Ôn thi HSK
//   ACADEMIC = "academic",     // Học thuật
//   DAILY = "daily",           // Giao tiếp
//   MIXED = "mixed",           // Hỗn hợp
// }
