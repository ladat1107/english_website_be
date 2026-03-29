import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";
class FileInfoDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsNotEmpty({ message: "URL không được để trống" })
    @IsString()
    url: string;

    @IsOptional()
    @Min(0, { message: "Kích thước file phải lớn hơn hoặc bằng 0" })
    size?: number;

    @IsOptional()
    @IsString()
    type?: string;
}

export class CreateWritingAnswerDto {
    @IsMongoId()
    @IsNotEmpty({ message: "ID đề luyện viết không được để trống" })
    writing_exam_id: string;

    @IsString()
    @IsOptional()
    answer?: string; // nội dung bài viết của học viên

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileInfoDto)
    files?: FileInfoDto[]; // link ảnh, file bài viết (hỗ trợ nhiều file)
}
