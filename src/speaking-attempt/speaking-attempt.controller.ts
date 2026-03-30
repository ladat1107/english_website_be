import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { SpeakingAttemptService } from './speaking-attempt.service';
import { CreateSpeakingAttemptDto } from './dto/create-speaking-attempt.dto';
import { UpdateSpeakingAttemptDto } from './dto/update-speaking-attempt.dto';
import { QueryGradingListDto } from './dto/query-grading-list.dto';

@Controller('speaking-attempt')
export class SpeakingAttemptController {
  constructor(private readonly speakingAttemptService: SpeakingAttemptService) { }

  @Post()
  create(
    @Req() req: any,
    @Body() createSpeakingAttemptDto: CreateSpeakingAttemptDto
  ) {
    return this.speakingAttemptService.create(createSpeakingAttemptDto, req.user);
  }

  @Patch(':id/submit')
  submit(@Param('id') id: string, @Req() req: any) {
    return this.speakingAttemptService.submitAttempt(id, req.user);
  }

  // =====================================================
  // USER ROUTES
  // =====================================================

  @Get('history/:examId')
  findHistoryByExamId(@Param('examId') examId: string, @Req() req: any) {
    return this.speakingAttemptService.findHistoryByExamId(examId, req.user._id);
  }

  @Get('detail/:attemptId')
  findDetailById(@Param('attemptId') attemptId: string, @Req() req: any) {
    return this.speakingAttemptService.findDetailById(attemptId, req.user._id);
  }

  @Get()
  findAll(@Query() query: QueryGradingListDto) {
    return this.speakingAttemptService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speakingAttemptService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpeakingAttemptDto: UpdateSpeakingAttemptDto) {
    return this.speakingAttemptService.update(id, updateSpeakingAttemptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speakingAttemptService.remove(id);
  }
}
