import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpeakingAttemptService } from './speaking-attempt.service';
import { CreateSpeakingAttemptDto } from './dto/create-speaking-attempt.dto';
import { UpdateSpeakingAttemptDto } from './dto/update-speaking-attempt.dto';

@Controller('speaking-attempt')
export class SpeakingAttemptController {
  constructor(private readonly speakingAttemptService: SpeakingAttemptService) {}

  @Post()
  create(@Body() createSpeakingAttemptDto: CreateSpeakingAttemptDto) {
    return this.speakingAttemptService.create(createSpeakingAttemptDto);
  }

  @Get()
  findAll() {
    return this.speakingAttemptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speakingAttemptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpeakingAttemptDto: UpdateSpeakingAttemptDto) {
    return this.speakingAttemptService.update(+id, updateSpeakingAttemptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speakingAttemptService.remove(+id);
  }
}
