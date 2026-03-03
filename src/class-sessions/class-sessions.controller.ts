import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { QueryClassSessionDto } from './dto/query-class-session';
import { Public } from '@/common/decorators/public.decorator';

@Controller('class-sessions')
export class ClassSessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) { }

  @Post()
  create(@Body() createClassSessionDto: CreateClassSessionDto, @Request() req: any) {
    return this.classSessionsService.create(createClassSessionDto, req.user);
  }

  @Public()
  @Get()
  findAll(@Query() query: QueryClassSessionDto, @Request() req: any) {
    return this.classSessionsService.findAll(query, req.user);
  }

  @Get('my-classes-sessions')
  findMyClassSessions(@Request() req: any) {
    return this.classSessionsService.findMyClassSessions(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classSessionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassSessionDto: UpdateClassSessionDto) {
    return this.classSessionsService.update(id, updateClassSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classSessionsService.remove(id);
  }
}
