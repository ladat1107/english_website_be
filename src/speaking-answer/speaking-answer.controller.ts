import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpeakingAnswerService } from './speaking-answer.service';
import { CreateSpeakingAnswerDto } from './dto/create-speaking-answer.dto';
import { UpdateSpeakingAnswerDto } from './dto/update-speaking-answer.dto';

@Controller('speaking-answer')
export class SpeakingAnswerController {
  constructor(private readonly speakingAnswerService: SpeakingAnswerService) { }

  @Patch(':id/ai-analysis')
  async updateAIAnalysis(@Param('id') id: string) {
    return this.speakingAnswerService.updateAIAnalysis(id);
  }

  @Post()
  create(@Body() createSpeakingAnswerDto: CreateSpeakingAnswerDto) {
    return this.speakingAnswerService.create(createSpeakingAnswerDto);
  }

  @Get()
  findAll() {
    return this.speakingAnswerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speakingAnswerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpeakingAnswerDto: UpdateSpeakingAnswerDto) {
    return this.speakingAnswerService.update(id, updateSpeakingAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speakingAnswerService.remove(id);
  }
}
