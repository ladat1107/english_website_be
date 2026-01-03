import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserFlashcardService } from './user-flashcard.service';
import { CreateUserFlashcardDto } from './dto/create-user-flashcard.dto';
import { UpdateUserFlashcardDto } from './dto/update-user-flashcard.dto';

@Controller('user-flashcard')
export class UserFlashcardController {
  constructor(private readonly userFlashcardService: UserFlashcardService) { }

  /**
   * Tạo hoặc cập nhật kết quả học flashcard
   * Nếu đã có kết quả cũ, sẽ ghi đè bằng kết quả mới
   */
  @Post()
  create(@Body() createUserFlashcardDto: CreateUserFlashcardDto) {
    return this.userFlashcardService.saveResult(createUserFlashcardDto);
  }

  /**
   * Lấy kết quả học của user cho 1 deck
   */
  @Get('deck/:deckId')
  getByDeck(@Param('deckId') deckId: string) {
    return this.userFlashcardService.getByDeck(deckId);
  }

  /**
   * Lấy tất cả kết quả học của user
   */
  @Get()
  findAll() {
    return this.userFlashcardService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userFlashcardService.remove(id);
  }
}
