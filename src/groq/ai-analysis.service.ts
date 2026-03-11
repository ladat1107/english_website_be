import { CreateChatAIDto } from '@/chat/dto/create-chat-ai.dto';
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

    /**
     * Phân tích văn bản bằng AI Groq
     * @param transcript - Văn bản đã chuyển đổi từ giọng nói
     * @param questionText - Câu hỏi gốc để AI hiểu ngữ cảnh
     * @returns Kết quả phân tích bao gồm: transcript, improvement, error, ai_fix
     */
    async analyzeTranscript(transcript: string, questionText: string): Promise<AIAnalysisResult> {
        try {
            // Tạo prompt chi tiết cho AI
            const prompt = this.buildAnalysisPrompt(transcript, questionText);

            // Gọi AI để phân tích
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile", // Model mạnh cho phân tích ngữ nghĩa
                messages: [
                    {
                        role: "system",
                        content: `You are an expert language teacher who provides constructive, friendly, and natural feedback. 
Your responses should be warm and conversational, like talking to a student. 
When there are no errors, give genuine praise and encouragement.
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
     * Xây dựng prompt cho AI để phân tích văn bản
     * @param transcript - Văn bản cần phân tích
     * @param questionText - Câu hỏi gốc
     * @returns Prompt hoàn chỉnh
     */
    private buildAnalysisPrompt(transcript: string, questionText: string): string {
        return `
You are a professional language teacher.

The student might answer in:
- English
- Chinese
- Vietnamese

Detect the language automatically.

IMPORTANT RULES:

- The explanations for mistakes and improvement suggestions MUST be written in Vietnamese so the student can clearly understand the feedback.
- The corrected answer (ai_fix) must be written in the SAME language as the student's response.

Question:
${questionText}

Student Response:
${transcript}

Your task:

1. Evaluate the response quality (grammar, vocabulary, clarity, fluency, relevance to question)

2. Provide friendly and constructive feedback.

3. Give a score from 0 to 100.

Return ONLY JSON with this structure:

{
  "score": 85,
  "improvement": ["gợi ý cải thiện bằng tiếng Việt"],
  "error": ["giải thích lỗi bằng tiếng Việt"],
  "ai_fix": "corrected and more natural version in the student's language"
}

Guidelines:

- Score range: 0 - 100
- 90-100: excellent answer
- 70-89: good answer with minor mistakes
- 50-69: understandable but several mistakes
- 30-49: many mistakes
- 0-29: very poor answer

Feedback style:
- Friendly
- Encouraging
- Clear and easy to understand
- Maximum 4 improvements

If the answer is good:
- Praise the student
- improvement can contain compliments (in Vietnamese)

If no errors:
- error should be []

Return ONLY JSON.
`;
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

    async chatWithAI(chatdto: CreateChatAIDto): Promise<string> {
        try {
            const promtChatAi = `
You are KhaiLingo AI — a friendly and knowledgeable language teacher on the KhaiLingo learning platform.

Communication style:
- Warm, natural, and human-like.
- Encouraging like a real tutor.
- Adapt explanations to the learner’s level.
- Be clear, accurate, and educational.

Main purpose:
- Help learners improve foreign language skills (English, Chinese).
- Teach vocabulary, grammar, pronunciation, expressions, translations, and conversation.
- Provide corrections and examples when learners make mistakes.

Language output guidelines:
- Adapt the format depending on what best helps the learner.
- For Chinese:
  - You may use Chinese characters (汉字), pinyin, explanations, or examples.
  - Choose the format that best supports learning.
  - If pronunciation is important, include pinyin.
  - If vocabulary learning, you may include character + pinyin + meaning.
- Do not force one format.

Topic handling:
- If the user asks something outside languages, do not refuse.
- Gently redirect the conversation toward language learning.

Response formatting:
- You may format answers using Markdown when helpful for learning.
- Use lists, bold text, examples, or sections to make explanations clearer.

Output format:
Always return valid JSON:

{
  "type": "response",
  "message": "<your answer in Markdown>"
}
`;
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
                max_tokens: 700, //
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

}
