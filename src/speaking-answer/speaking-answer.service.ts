import { Injectable } from '@nestjs/common';
import { CreateSpeakingAnswerDto } from './dto/create-speaking-answer.dto';
import { UpdateSpeakingAnswerDto } from './dto/update-speaking-answer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SpeakingAnswer } from './schemas/speaking-answer.schemas';
import { Model, Types } from 'mongoose';
import { SpeechToTextService } from '@/groq/speech-to-text.service';
import { AIAnalysisService } from '@/groq/ai-analysis.service';

@Injectable()
export class SpeakingAnswerService {

  constructor(
    @InjectModel(SpeakingAnswer.name)
    private readonly speakingAnswerModel: Model<SpeakingAnswer>,
    private speechToTextService: SpeechToTextService,
    private aiAnalysisService: AIAnalysisService
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
    questionText: string
  ): Promise<void> {
    try {
      // Bước 1: Chuyển đổi giọng nói thành văn bản
      const transcription = await this.speechToTextService.transcribe(audioUrl);

      // Bước 2: Phân tích văn bản bằng AI
      const analysis = await this.aiAnalysisService.analyzeTranscript(
        transcription.text,
        questionText
      );

      // Bước 3: Tính điểm số dựa trên phân tích
      const score = this.aiAnalysisService.calculateScore(analysis);

      // Bước 4: Cập nhật kết quả vào database
      await this.speakingAnswerModel.findByIdAndUpdate(answerId, {
        $set: {
          ai_analysis: {
            transcript: analysis.transcript,
            improvement: analysis.improvement,
            error: analysis.error,
            ai_fix: analysis.ai_fix
          },
          score: score
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

  findOne(id: number) {
    return `This action returns a #${id} speakingAnswer`;
  }

  update(id: number, updateSpeakingAnswerDto: UpdateSpeakingAnswerDto) {
    return `This action updates a #${id} speakingAnswer`;
  }

  remove(id: number) {
    return `This action removes a #${id} speakingAnswer`;
  }
}
