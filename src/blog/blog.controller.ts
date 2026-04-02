import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { Public } from '@/common/decorators/public.decorator';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @Req() req: any) {
    return this.blogService.create(createBlogDto, req.user);
  }

  @Get()
  @Public()
  findAll(@Query() queryBlogDto: QueryBlogDto, @Req() req: any) {
    return this.blogService.findAll(queryBlogDto, req.user);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.blogService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Req() req: any) {
    return this.blogService.update(id, updateBlogDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.blogService.remove(id, req.user);
  }
}
