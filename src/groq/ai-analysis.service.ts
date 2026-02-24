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
                        content: `You are an expert English teacher who provides constructive, friendly, and natural feedback. 
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
Analyze this English speaking response and provide feedback in a friendly, natural way.

**Question**: ${questionText}

**Student's Response**: ${transcript}

Please analyze and return a JSON object with these fields:

1. **improvement**: Array of friendly suggestions (if any). Use conversational language like "You could try...", "It might sound more natural if...". If the response is good, give genuine praise instead.

2. **error**: Array of specific errors found (grammar, vocabulary, pronunciation issues reflected in transcript). Be specific but kind. If no errors, use empty array.

3. **ai_fix**: A corrected version of the transcript. If there are no errors, return the original. Make it sound natural and conversational.

**Important Guidelines**:
- Be warm and encouraging, not robotic
- If the response is good, celebrate it! Use phrases like "Great job!", "Well done!", "Your answer is excellent!"
- If there are minor issues, start with something positive before suggesting improvements
- Keep improvement suggestions practical and actionable
- Don't be overly critical - focus on 2-3 key improvements maximum
- Use natural language, avoid stiff formal feedback

Return ONLY a valid JSON object with this structure:
{
    "improvement": ["suggestion 1", "suggestion 2"],
    "error": ["error 1", "error 2"],
    "ai_fix": "corrected text here"
}`;
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
            ai_fix: typeof aiResponse.ai_fix === 'string' && aiResponse.ai_fix.trim()
                ? aiResponse.ai_fix
                : originalTranscript
        };
    }

    /**
     * Tính điểm số dựa trên phân tích của AI
     * @param analysisResult - Kết quả phân tích
     * @returns Điểm số từ 0-100
     */
    calculateScore(analysisResult: AIAnalysisResult): number {
        const errorCount = analysisResult.error.length;
        const transcript = analysisResult.transcript.trim();

        // Điểm cơ bản
        let score = 100;

        // Trừ điểm theo số lỗi
        score -= errorCount * 10;

        // Trừ điểm nếu câu trả lời quá ngắn
        const wordCount = transcript.split(/\s+/).length;
        if (wordCount < 10) {
            score -= 20;
        } else if (wordCount < 20) {
            score -= 10;
        }

        // Đảm bảo điểm trong khoảng 0-100
        return Math.max(0, Math.min(100, score));
    }
}
