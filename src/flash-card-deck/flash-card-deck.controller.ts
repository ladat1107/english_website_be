import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlashCardDeckService } from './flash-card-deck.service';
import { CreateFlashCardDeckDto } from './dto/create-flash-card-deck.dto';
import { UpdateFlashCardDeckDto } from './dto/update-flash-card-deck.dto';

@Controller('flash-card-deck')
export class FlashCardDeckController {
  constructor(private readonly flashCardDeckService: FlashCardDeckService) {}

  @Post()
  create(@Body() createFlashCardDeckDto: CreateFlashCardDeckDto) {
    return this.flashCardDeckService.create(createFlashCardDeckDto);
  }

  @Get()
  findAll() {
    return this.flashCardDeckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashCardDeckService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlashCardDeckDto: UpdateFlashCardDeckDto) {
    return this.flashCardDeckService.update(+id, updateFlashCardDeckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashCardDeckService.remove(+id);
  }
}
