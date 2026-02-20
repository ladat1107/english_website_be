import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateSpeakingQuestionDto {

    @IsNumber()
    @Min(1)
    question_number: number;

    @IsNotEmpty({ message: "Nội dung câu hỏi không được để trống" })
    @IsString()
    question_text: string;

    @IsOptional()
    @IsString()
    suggested_answer?: string;
}
