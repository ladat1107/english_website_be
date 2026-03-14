import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserFlashcardService } from './user-flashcard.service';
import { CreateUserFlashcardDto } from './dto/create-user-flashcard.dto';

@Controller('user-flashcard')
export class UserFlashcardController {
  constructor(private readonly userFlashcardService: UserFlashcardService) { }

  @Post()
  create(@Body() createUserFlashcardDto: CreateUserFlashcardDto) {
    return null;
  }

  @Get()
  findAll() {
    return this.userFlashcardService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userFlashcardService.remove(id);
  }
}
