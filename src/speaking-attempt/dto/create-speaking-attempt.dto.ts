import { IsMongoId, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class MultipleChoiceAnswerDto {
    @IsNotEmpty({ message: "Số thứ tự câu hỏi không được để trống" })
    @IsNumber()
    question_number: number;

    @IsNotEmpty({ message: "Lựa chọn đã chọn không được để trống" })
    @IsString()
    selected_option: string;
}
export class CreateSpeakingAttemptDto {
    @IsMongoId()
    exam_id: string;
}
