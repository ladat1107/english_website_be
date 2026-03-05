// speech.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class SpeechToTextService {
    private groq;
    constructor(
        private configService: ConfigService,
    ) {
        this.groq = new Groq({ apiKey: this.configService.get<string>('groq.apiKey') });
    }

    async transcribe(audioUrl: string, language: string = 'en') {
        const response = await this.groq.audio.transcriptions.create({
            model: "whisper-large-v3",
            url: audioUrl,
            language: language,
        });

        return { text: response.text };
    }
}