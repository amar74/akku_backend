import { Injectable } from '@nestjs/common';
import { IWithTransactionClient, PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ISingleBucketUpload } from '../bucket/decorators/bucket-uploads.decorator';
import dayjs from '../../lib/custom-dayjs';


type FileRelationOmitProperties = "name" | "type" | "size" | "id" | "url" | "fieldname" | "upload_date";
interface IUpsertFile extends IWithTransactionClient {
  file: Prisma.FileCreateInput;
  where: Prisma.FileWhereUniqueInput;
  createRelationInput: Omit<Prisma.FileCreateInput, FileRelationOmitProperties>
}
interface IRemoveFileById extends IWithTransactionClient {
  file_id: string;
}
interface ICreateFile extends IWithTransactionClient {
  file: Prisma.FileCreateInput;
  createRelationInput: Omit<Prisma.FileCreateInput, FileRelationOmitProperties>
}
interface IUpdateFile extends IWithTransactionClient { file_id: string, data: Prisma.FileUpdateInput }


@Injectable()
export class FileService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async createFile({ file, createRelationInput = {}, prisma }: ICreateFile) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.file.create({
      data: {
        ...file,
        ...createRelationInput
      }
    })
  }

  findAll() {
    return `This action returns all file`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  async update({ file_id, data, prisma }: IUpdateFile) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.file.update({
      where: { id: file_id },
      data
    });
  }

  async removeFileById({ file_id, prisma }: IRemoveFileById) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.file.delete({
      where: { id: file_id }
    })
  }

  async upsertFile({ file, where, createRelationInput = {}, prisma }: IUpsertFile) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.file.upsert({
      where,
      create: {
        ...file,
        ...createRelationInput,
      },
      update: file
    })
  }

  getFilePayload(bucket_uploads: ISingleBucketUpload): Prisma.FileCreateInput {
    return {
      name: bucket_uploads.key,
      url: bucket_uploads.url,
      type: bucket_uploads.mimetype,
      size: bucket_uploads.size
    }
  }
}
