import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { UserFlashcardService } from './user-flashcard.service';
import { CreateUserFlashcardDto } from './dto/create-user-flashcard.dto';
import { Public } from '@/common/decorators/public.decorator';
import { QueryFlashCardDeckDto } from '@/flash-card-deck/dto/query-flash-card-desk.dto';

@Controller('user-flashcard')
export class UserFlashcardController {
  constructor(private readonly userFlashcardService: UserFlashcardService) { }

  @Post()
  create(@Body() createUserFlashcardDto: CreateUserFlashcardDto) {
    return null;
  }

  @Public()
  @Get()
  findAll(@Query() query: QueryFlashCardDeckDto, @Req() req) {
    return this.userFlashcardService.findAll(query, req?.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userFlashcardService.remove(id);
  }
}
