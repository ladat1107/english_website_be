import { Module } from '@nestjs/common';
import { SpeakingAttemptService } from './speaking-attempt.service';
import { SpeakingAttemptController } from './speaking-attempt.controller';

@Module({
  controllers: [SpeakingAttemptController],
  providers: [SpeakingAttemptService],
})
export class SpeakingAttemptModule {}
