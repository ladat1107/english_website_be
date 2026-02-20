import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { SpeakingExamService } from './speaking-exam.service';
import { CreateSpeakingExamDto } from './dto/create-speaking-exam.dto';
import { UpdateSpeakingExamDto } from './dto/update-speaking-exam.dto';
import { QuerySpeakingExamDto } from './dto/query-speaking-exam';

@Controller('speaking-exam')
export class SpeakingExamController {
  constructor(private readonly speakingExamService: SpeakingExamService) { }

  @Post()
  create(@Body() createSpeakingExamDto: CreateSpeakingExamDto, @Req() req: any) {
    return this.speakingExamService.create(createSpeakingExamDto, req.user);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QuerySpeakingExamDto) {
    return this.speakingExamService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speakingExamService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpeakingExamDto: UpdateSpeakingExamDto) {
    return this.speakingExamService.update(id, updateSpeakingExamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speakingExamService.remove(id);
  }
}
