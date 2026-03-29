import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { WritingAnswerService } from './writing-answer.service';
import { CreateWritingAnswerDto } from './dto/create-writing-answer.dto';
import { UpdateWritingAnswerDto } from './dto/update-writing-answer.dto';
import { QueryWritingAnswerDto } from './dto/query-writing-answer.dto';
import { Public } from '@/common/decorators/public.decorator';

@Controller('writing-answer')
export class WritingAnswerController {
  constructor(private readonly writingAnswerService: WritingAnswerService) { }

  @Post()
  create(@Body() createWritingAnswerDto: CreateWritingAnswerDto, @Req() req: any) {
    return this.writingAnswerService.create(createWritingAnswerDto, req.user);
  }

  @Get()
  findAll(@Query() query: QueryWritingAnswerDto, @Req() req: any) {
    return this.writingAnswerService.findAll(query, req.user);
  }

  @Get('exam/:examId')
  findByExamId(@Param('examId') examId: string, @Req() req: any) {
    return this.writingAnswerService.findByExamId(examId, req.user?._id);
  }

  @Get('exam/:examId/pinned')
  @Public()
  findPinnedByExamId(@Param('examId') examId: string) {
    return this.writingAnswerService.findPinnedByExamId(examId);
  }

  @Get('history/:examId')
  findUserHistory(@Param('examId') examId: string, @Req() req: any) {
    return this.writingAnswerService.findUserHistory(examId, req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.writingAnswerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWritingAnswerDto: UpdateWritingAnswerDto) {
    return this.writingAnswerService.update(id, updateWritingAnswerDto);
  }

  @Patch(':id/ai-analysis')
  updateAIAnalysis(@Param('id') id: string) {
    return this.writingAnswerService.updateAIAnalysis(id);
  }

  @Patch(':id/toggle-pin')
  togglePin(@Param('id') id: string) {
    return this.writingAnswerService.togglePin(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.writingAnswerService.remove(id);
  }
}
