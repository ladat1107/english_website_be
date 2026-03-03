import { Module } from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionsController } from './class-sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassSessionSchema } from './schemas/class-session.schemas';
import { UsersModule } from '@/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ClassSession', schema: ClassSessionSchema }]),
    UsersModule
  ],
  exports: [ClassSessionsService],
  controllers: [ClassSessionsController],
  providers: [ClassSessionsService],
})
export class ClassSessionsModule { }
