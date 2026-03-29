import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { WritingExamService } from './writing-exam.service';
import { CreateWritingExamDto } from './dto/create-writing-exam.dto';
import { UpdateWritingExamDto } from './dto/update-writing-exam.dto';
import { QueryWritingExamDto } from './dto/query-writing-exam.dto';
import { Public } from '@/common/decorators/public.decorator';
import { SkipResponseInterceptor } from '@/common/decorators/skip-response-interceptor.decorator';

@Controller('writing-exam')
export class WritingExamController {
  constructor(private readonly writingExamService: WritingExamService) { }

  @Post()
  create(@Body() createWritingExamDto: CreateWritingExamDto, @Req() req: any) {
    return this.writingExamService.create(createWritingExamDto, req.user);
  }

  @Get()
  @Public()
  findAll(@Req() req: any, @Query() query: QueryWritingExamDto) {
    return this.writingExamService.findAll(query, req.user);
  }

  @Get('public-seo')
  @Public()
  @SkipResponseInterceptor()
  findPublicSeo() {
    return this.writingExamService.findPublicSeo();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.writingExamService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWritingExamDto: UpdateWritingExamDto) {
    return this.writingExamService.update(id, updateWritingExamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.writingExamService.remove(id);
  }
}
