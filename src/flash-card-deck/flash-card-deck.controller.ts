import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { FlashCardDeckService } from './flash-card-deck.service';
import { CreateFlashCardDeckDto, CreateFlashcardDto } from './dto/create-flash-card-deck.dto';
import { UpdateFlashCardDeckDto, UpdateFlashCardDto } from './dto/update-flash-card-deck.dto';
import { QueryFlashCardDeckDto } from './dto/query-flash-card-desk.dto';
import { Public } from '@/common/decorators/public.decorator';

@Controller('flash-card-deck')
export class FlashCardDeckController {
  constructor(private readonly flashCardDeckService: FlashCardDeckService) { }

  @Post()
  create(@Body() createFlashCardDeckDto: CreateFlashCardDeckDto, @Req() req) {
    return this.flashCardDeckService.create(createFlashCardDeckDto, req.user);
  }

  @Get()
  findAll(@Query() query: QueryFlashCardDeckDto) {
    return this.flashCardDeckService.findAll(query);
  }

  @Public()
  @Get('client')
  findAllForClient(@Query() query: QueryFlashCardDeckDto, @Req() req) {
    return this.flashCardDeckService.findAllForClient(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.flashCardDeckService.findOne(id, req.user);
  }

  @Patch(':id/create-flashcard')
  CreateFlashcard(@Param('id') id: string, @Body() createFlashcardDto: CreateFlashcardDto, @Req() req) {
    return this.flashCardDeckService.createFlashcard(id, createFlashcardDto, req.user);
  }

  @Patch(':id/update-flashcard')
  UpdateFlashcard(
    @Param('id') id: string,
    @Body() updateFlashCardDto: UpdateFlashCardDto,
    @Req() req
  ) {
    return this.flashCardDeckService.updateFlashcard(id, updateFlashCardDto, req.user);
  }

  @Post('generate-flashcard')
  generateFlashcard(@Body('word') word: string) {
    return this.flashCardDeckService.generateFlashcard(word);
  }

  @Patch(':id/delete-flashcard')
  DeleteFlashcard(
    @Param('id') id: string,
    @Body('flashcardId') flashcardId: string,
    @Req() req
  ) {
    console.log('Received request to delete flashcard with ID:', flashcardId, 'from deck ID:', id);
    return this.flashCardDeckService.deleteFlashcard(id, flashcardId, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlashCardDeckDto: UpdateFlashCardDeckDto, @Req() req) {
    return this.flashCardDeckService.update(id, updateFlashCardDeckDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.flashCardDeckService.remove(id, req.user);
  }


}
