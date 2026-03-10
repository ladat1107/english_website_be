import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() queryUserDto: QueryUserDto) {
    return this.usersService.findAll(queryUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('/profile')
  updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req: any) {
    return this.usersService.updateProfile(updateProfileDto, req.user);
  }

  @Patch('booking-test')
  async updateBookingTest(@Body() updateProfileDto: UpdateProfileDto, @Request() req: any) {
    const user = await this.usersService.findById(req.user._id);
    
    let data: any = {
      booking_test: new Date(),
    };

    if (user && !user.phone) {
      data.phone = updateProfileDto.phone;
    }
    return this.usersService.update(req.user._id, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }



  //////////////////////////
  @Get('me/achievements')
  getMyAchievent() {
    return null;
  }

  @Get('me/stats')
  getMyStatus() {
    return null;
  }
  @Get('/exam-attempts/me/recent')
  ah() {
    return null;
  }
  @Get('speaking-attempts/me/recent')
  hg() {
    return null;
  }
}
