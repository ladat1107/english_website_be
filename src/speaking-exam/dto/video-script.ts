import { IsNotEmpty, IsString } from "class-validator";

export class CreateVideoScriptDto {
    @IsNotEmpty({ message: "Người nói không được để trống" })
    @IsString()
    speaker: string;

    @IsNotEmpty({ message: "Nội dung không được để trống" })
    @IsString()
    content: string;

    @IsNotEmpty({ message: "Bản dịch không được để trống" })
    @IsString()
    translation: string;
}