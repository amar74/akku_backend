import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface ISingleBucketUpload {
    url: string;
    key: string;
    size: number;
    mimetype: string;
}

export type BucketUploadsType = ISingleBucketUpload;


export const BucketUploads = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.bucket_uploads;
})
