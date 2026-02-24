import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { AIAnalysisService } from './ai-analysis.service';

@Module({
    providers: [SpeechToTextService, AIAnalysisService],
    exports: [SpeechToTextService, AIAnalysisService],
})
export class GroqModule { }