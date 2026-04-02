import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './schemas/blog.schemas';
import { Model, Types } from 'mongoose';
import { JwtPayload } from '@/auth/auth.service';
import { QueryBlogDto } from './dto/query-blog.dto';
import { calculateSkip, createPaginatedResponse } from '@/common/dto/pagination.dto';
import { UserRole } from '@/utils/constants/enum';
import { buildVietnameseRegex } from '@/utils/functions/function';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<Blog>,
  ) { }

  async create(createBlogDto: CreateBlogDto, user: JwtPayload) {
    const blog = await this.blogModel.create({
      ...createBlogDto,
      author: new Types.ObjectId(user._id),
    });
    return blog;
  }

  async findAll(queryBlogDto: QueryBlogDto, user: JwtPayload) {
    try {
      const { page = 1, limit = 10, search, category, is_public, is_special } = queryBlogDto;
      const skip = calculateSkip(page, limit);
      const match: any = {};

      if (category) {
        match.category = category;
      }
      if (is_public !== undefined) {
        match.is_public = is_public;
      }
      if (is_special !== undefined) {
        match.is_special = is_special;
      }

      if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER)) {
        match.is_public = true;
      }

      const buildSearch = search ? buildVietnameseRegex(search) : null;

      const searchFilter = buildSearch ? {
        $or: [
          { title: { $regex: buildSearch, $options: 'i' } },
          { description: { $regex: buildSearch, $options: 'i' } },
          { content: { $regex: buildSearch, $options: 'i' } },
          { 'author.full_name': { $regex: buildSearch, $options: 'i' } },
          { 'author.email': { $regex: buildSearch, $options: 'i' } },
        ],
      } : {};

      const pipeline: any = [{
        $match: { ...match }
      }, {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      }, {
        $unwind: '$author'
      }, {
        $unset: ['author.refreshTokenHash']
      },
      ...searchFilter ? [{ $match: searchFilter }] : [],
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }]
        }
      }, {
        $unwind: {
          path: "$metadata",
          preserveNullAndEmptyArrays: true
        }
      }, {
        $project: {
          totalItems: '$metadata.total',
          items: '$data',
        }
      }
      ]
      const blogs = await this.blogModel.aggregate(pipeline);
      if (!blogs || blogs.length === 0) {
        return createPaginatedResponse([], 0, page, limit);
      }
      return createPaginatedResponse(blogs[0].items, blogs[0].totalItems, page, limit);
    } catch (error) {
      console.error("Error in findAll blog: ", error);
      throw error;
    }
  }

  async findOne(id: string, user: JwtPayload) {
    try {

      const blog = await this.blogModel.findOne({
        _id: new Types.ObjectId(id),
        ...(!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) && { is_public: true })
      })
        .populate('author', '_id full_name email avatar_url')
        .lean()
        .exec();

      if (!blog) {
        throw new NotFoundException('Không tìm thấy bài viết');
      }

      return blog;
    } catch (error) {
      console.error("Error in findOne blog: ", error);
      throw error;
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, user: JwtPayload) {
    try {
      const blogUpdate = await this.blogModel.findByIdAndUpdate(new Types.ObjectId(id), {
        $set: updateBlogDto,
      }, { new: true })
        .lean()
        .exec();

      if (!blogUpdate) {
        throw new NotFoundException('Không tìm thấy bài viết');
      }

      return blogUpdate;
    } catch (error) {
      console.error("Error in update blog: ", error);
      throw error;
    }
  }

  async remove(id: string, user: JwtPayload): Promise<any> {
    try {
      const blog = await this.blogModel.findById(new Types.ObjectId(id)).exec();
      if (!blog) {
        throw new NotFoundException('Không tìm thấy bài viết');
      }
      if ((user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) || blog.author.toString() !== user._id) {
        throw new Error('Bạn không có quyền xóa bài viết');
      }

      return await this.blogModel.deleteOne({ _id: new Types.ObjectId(id) }).lean().exec();
    } catch (error) {
      console.error("Error in remove blog: ", error);
      throw error;
    }
  }
}
