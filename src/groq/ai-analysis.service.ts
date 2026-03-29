import { CreateChatAIDto } from '@/chat/dto/create-chat-ai.dto';
import { CreateFlashcardDto } from '@/flash-card-deck/dto/create-flash-card-deck.dto';
import { buildAnalysisPrompt } from '@/speaking-answer/dto/promt-speaking';
import { buildWritingAnalysisPrompt } from '@/writing-answer/dto/promt-writing';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

/**
 * Interface định nghĩa kết quả phân tích từ AI
 */
export interface AIAnalysisResult {
    transcript: string;
    improvement: string[];
    error: string[];
    ai_fix: string;
    score?: number; // Điểm số từ 0-100, có thể được tính riêng
}

interface AIResponse {
    type: "response";
    message: string;
}
@Injectable()
export class AIAnalysisService {
    private groq: Groq;

    constructor(private configService: ConfigService) {
        this.groq = new Groq({ apiKey: this.configService.get<string>('groq.apiKey') });
    }

    async analyzeTranscript(transcript: string, questionText: string): Promise<AIAnalysisResult> {
        try {
            // Tạo prompt chi tiết cho AI
            const prompt = buildAnalysisPrompt(transcript, questionText);

            // Gọi AI để phân tích
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile", // Model mạnh cho phân tích ngữ nghĩa
                messages: [
                    {
                        role: "system",
                        content: `You are an expert language teacher who provides constructive, friendly, and natural feedback. 
Your responses should be warm and conversational, like talking to a student. 
When there are no errors, give genuine praise and encouragement.
Be strict and apply high standards when scoring and evaluating responses, do not give high scores easily.
Always respond in JSON format.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7, // Độ sáng tạo vừa phải
                max_tokens: 1500,
                response_format: { type: "json_object" } // Yêu cầu trả về JSON
            });

            // Parse kết quả từ AI
            const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');

            // Validate và format kết quả
            return this.formatAnalysisResult(aiResponse, transcript);

        } catch (error) {
            console.error('Error in AI analysis:', error);

            // Trả về kết quả mặc định nếu có lỗi
            return {
                transcript,
                improvement: ['Không thể phân tích lúc này, vui lòng thử lại sau.'],
                error: [],
                ai_fix: transcript
            };
        }
    }

    /**
     * Format và validate kết quả từ AI
     * @param aiResponse - Response từ AI
     * @param originalTranscript - Văn bản gốc
     * @returns Kết quả đã được format chuẩn
     */
    private formatAnalysisResult(aiResponse: any, originalTranscript: string): AIAnalysisResult {
        return {
            transcript: originalTranscript,

            improvement: Array.isArray(aiResponse.improvement)
                ? aiResponse.improvement
                : [],

            error: Array.isArray(aiResponse.error)
                ? aiResponse.error
                : [],

            ai_fix:
                typeof aiResponse.ai_fix === 'string' && aiResponse.ai_fix.trim()
                    ? aiResponse.ai_fix
                    : originalTranscript,

            score:
                typeof aiResponse.score === 'number'
                    ? Math.max(0, Math.min(100, aiResponse.score))
                    : 0
        };
    }

    //=============================================================================================================================================

    async chatWithAI(chatdto: CreateChatAIDto, promtChatAi: string): Promise<string> {
        try {
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile", // Model mạnh cho phân tích ngữ nghĩa
                messages: [
                    {
                        role: "system",
                        content: promtChatAi
                    },
                    ...chatdto.messages.map(msg => ({
                        role: msg.role as "user" | "assistant",
                        content: msg.content
                    }))
                ],
                temperature: 0.7, // Độ sáng tạo vừa phải
                max_tokens: 400, //
                response_format: { type: "json_object" } // Yêu cầu trả về JSON
            });

            const content = completion.choices[0]?.message?.content;

            if (!content) {
                return "Xin lỗi, đã xảy ra lỗi khi kết nối với AI.";
            }

            const parsed: AIResponse = JSON.parse(content);

            return parsed.message;
        } catch (error) {
            console.error('Error in AI chat:', error);
            return "Xin lỗi, đã xảy ra lỗi khi kết nối với AI.";
        }
    }

    async generateFlashcard(word: string, promtAi: string): Promise<CreateFlashcardDto> {
        const flashcardDefault: CreateFlashcardDto = {
            text: word,
            meaning: "Nghĩa của từ",
        };
        try {

            const completion = await this.groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                temperature: 0.2,
                max_tokens: 200,
                messages: [
                    {
                        role: "system",
                        content: promtAi
                    },
                    {
                        role: "user",
                        content: `Generate flashcard for word: ${word}`
                    }
                ],
                response_format: { type: "json_object" } // Yêu cầu trả về JSON
            });

            const content = completion.choices[0]?.message?.content;

            if (!content) {
                return flashcardDefault;
            }
            const parsed: CreateFlashcardDto = JSON.parse(content);

            return parsed;

        } catch (error) {
            console.error('Error in AI chat:', error);
            return flashcardDefault;
        }
    }

    async analysisWritingAnswer(answerText: string, questionText: string,): Promise<AIAnalysisResult> {
        try {
            const promt = buildWritingAnalysisPrompt(answerText, questionText);
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile", // Model mạnh cho phân tích ngữ nghĩa
                messages: [
                    {
                        role: "system",
                        content: `You are an expert English and Chinese language teacher with over 10 years of experience in academic writing assessment.
                        Evaluate student responses professionally and objectively.Provide feedback that is constructive, specific, and easy to understand.
                        When there are no errors, give genuine praise and encouragement.
                        Be strict and apply high standards when scoring and evaluating responses, do not give high scores easily.
                        Always respond in JSON format.`
                    },
                    {
                        role: "user",
                        content: promt
                    }
                ],
                temperature: 0.3, // Độ sáng tạo vừa phải
                max_tokens: 1500,
                response_format: { type: "json_object" } // Yêu cầu trả về JSON
            });

            const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');

            return this.formatAnalysisResult(aiResponse, answerText);
        } catch (error) {
            console.error('Error in AI analysis:', error);
            return {
                transcript: "",
                improvement: ['Không thể phân tích lúc này, vui lòng thử lại sau.'],
                error: [],
                ai_fix: answerText
            };
        }
    }
}
