import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateSpeakingAnswerDto } from './dto/create-speaking-answer.dto';
import { UpdateSpeakingAnswerDto } from './dto/update-speaking-answer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SpeakingAnswer } from './schemas/speaking-answer.schemas';
import { ClientSession, Model, Types } from 'mongoose';
import { SpeechToTextService } from '@/groq/speech-to-text.service';
import { AIAnalysisService } from '@/groq/ai-analysis.service';
import { SpeakingAttemptService } from '@/speaking-attempt/speaking-attempt.service';
import { checkLanguage } from '@/utils/functions/function';

@Injectable()
export class SpeakingAnswerService {

  constructor(
    @InjectModel(SpeakingAnswer.name)

    private readonly speakingAnswerModel: Model<SpeakingAnswer>,
    private speechToTextService: SpeechToTextService,
    private aiAnalysisService: AIAnalysisService,

    @Inject(forwardRef(() => SpeakingAttemptService))
    private speakingAttemptService: SpeakingAttemptService,
  ) { }

  async create(createSpeakingAnswerDto: CreateSpeakingAnswerDto) {
    const { attempt_id, question, audio_url, duration_seconds } = createSpeakingAnswerDto;

    // Tạo hoặc cập nhật bản ghi câu trả lời
    const newAnswer = await this.speakingAnswerModel.findOneAndUpdate({
      attempt_id: new Types.ObjectId(attempt_id),
      "question.question_number": question.question_number
    }, {
      $set: {
        question,
        audio_url,
        duration_seconds
      }
    }, { upsert: true, new: true });

    // Xử lý bất đồng bộ: Chuyển đổi giọng nói -> Phân tích AI -> Lưu kết quả
    this.processAudioAnalysis(newAnswer._id.toString(), audio_url, question.question_text)
      .catch(err => {
        console.error('Error processing audio analysis:', err);
      });

    return newAnswer;
  }

  async updateAIAnalysis(id: string) {
    try {
      const answer = await this.speakingAnswerModel.findById(id);

      if (!answer) {
        throw new Error('Không tìm thấy câu trả lời');
      }

      await this.processAudioAnalysis(id, answer.audio_url, answer.question.question_text);

      return { message: 'AI analysis updated successfully' };
    } catch (error) {
      console.error('Error in updateAIAnalysis:', error);
      throw error;
    }
  }

  /**
   * Xử lý phân tích âm thanh: Chuyển đổi giọng nói -> Phân tích AI -> Cập nhật database
   * @param answerId - ID của câu trả lời
   * @param audioUrl - URL file âm thanh
   * @param questionText - Nội dung câu hỏi
   */
  private async processAudioAnalysis(
    answerId: string,
    audioUrl: string,
    questionText: string,
  ): Promise<void> {
    try {
      // Bước 1: Chuyển đổi giọng nói thành văn bản
      const transcription = await this.speechToTextService.transcribe(audioUrl, checkLanguage(questionText));

      // Bước 2: Phân tích văn bản bằng AI
      const analysis = await this.aiAnalysisService.analyzeTranscript(
        transcription.text,
        questionText
      );

      // Bước 3: Tính điểm số dựa trên phân tích


      // Bước 4: Cập nhật kết quả vào database
      await this.speakingAnswerModel.findByIdAndUpdate(answerId, {
        $set: {
          ai_analysis: {
            transcript: analysis.transcript,
            improvement: analysis.improvement,
            error: analysis.error,
            ai_fix: analysis.ai_fix
          },
          score: analysis.score
        }
      });
    } catch (error) {
      console.error(`[${answerId}] Error in audio analysis:`, error);
      throw error;
    }
  }

  async bulkCreate(createSpeakingAnswerDtos: CreateSpeakingAnswerDto[], session: any) {
    try {
      const createdSpeakingAnswers = await this.speakingAnswerModel.insertMany(createSpeakingAnswerDtos, { session });
      return createdSpeakingAnswers;
    } catch (error) {
      console.error('Error in bulkCreate:', error);
      throw error;
    }
  }

  async findByAttemptId(attemptId: string) {
    return this.speakingAnswerModel.find({ attempt_id: new Types.ObjectId(attemptId) }).lean();
  }

  findAll() {
    return `This action returns all speakingAnswer`;
  }

  async findOne(id: string) {
    const answer = await this.speakingAnswerModel.findById(id);
    if (!answer) {
      throw new Error('Không tìm thấy câu trả lời');
    }
    return answer;
  }

  async update(id: string, updateSpeakingAnswerDto: UpdateSpeakingAnswerDto) {

    try {
      const updatedAnswer = await this.speakingAnswerModel.findByIdAndUpdate(id, {
        $set: {
          ...updateSpeakingAnswerDto
        }
      }, { new: true });
      if (!updatedAnswer) {
        throw new Error('Không tìm thấy câu trả lời');
      }

      if (updateSpeakingAnswerDto.teacher_feedback) {
        // Nếu có feedback mới, tự động cập nhật has_teacher_feedback của SpeakingAttempt
        await this.speakingAttemptService.update(updatedAnswer.attempt_id.toString(), { has_teacher_feedback: true });
      }
      return updatedAnswer;
    } catch (error) {
      console.error('Error updating speaking answer:', error);
      throw error;
    }
  }

  async remove(id: string) {
    const deletedAnswer = await this.speakingAnswerModel.findByIdAndDelete(id);
    if (!deletedAnswer) {
      throw new Error('Không tìm thấy câu trả lời để xóa');
    }
    return deletedAnswer;
  }

  async removeByAttemptIds(attemptIds: Types.ObjectId[], session?: ClientSession): Promise<any> {
    return this.speakingAnswerModel
      .deleteMany({ attempt_id: { $in: attemptIds } })
      .session(session || null);
  }
}
