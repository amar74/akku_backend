import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post()
  create(@Body() createFileDto: CreateFileDto) {
    return { success: true, message: "This is under development...." };
  }

  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return { success: true, message: "This is under development...." };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { success: true, message: "This is under development...." };
  }
}
