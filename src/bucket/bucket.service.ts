import { DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

interface IUploadWithoutMulter {
    name: string;
    buffer: Buffer;
    contentDisposition?: string;
    mimetype: string;
    fieldname: string;
    size: number;
}


@Injectable()
export class BucketService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
    }

    async upload(file: Express.Multer.File, contentDisposition: string = 'inline') {
        const key = `${Date.now()}_${file.originalname}`;
        const body = file.buffer;

        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentDisposition: contentDisposition,
            ContentType: file.mimetype
        }));

        return {
            url: `https://s3.ap-southeast-2.amazonaws.com/${this.bucketName}/${key}`,
            fieldname: file.fieldname,
            key: key,
            size: file.size,
            mimetype: file.mimetype
        };
    }

    async uploadWithoutMulter({ buffer, name, mimetype, fieldname, size = 0, contentDisposition = 'inline' }: IUploadWithoutMulter) {
        const key = `${Date.now()}_${name}`;
        const body = buffer;

        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentDisposition: contentDisposition,
            ContentType: mimetype
        }));

        return {
            url: `https://s3.ap-southeast-2.amazonaws.com/${this.bucketName}/${key}`,
            fieldname: fieldname,
            key: key,
            size: size,
            mimetype: mimetype
        };
    }

    async remove(key: string) {
        await this.s3Client.send(
            new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
        );
        return { success: true, message: `${key} deleted successfully.` };
    }

    async uploadMany(files: Express.Multer.File[], contentDisposition = "inline") {
        let uploadPromises = [];

        files.forEach((file) => {
            uploadPromises.push(
                new Promise((resolve, reject) => {
                    try {
                        const res = this.upload(file, contentDisposition);
                        resolve(res);
                    } catch (error) {
                        reject(error);
                    }
                })
            );
        });

        const urls = await Promise.all(uploadPromises);
        return urls;
    };

    async removeMany(keys: string[] = []) {
        let removePromises = [];

        keys.forEach((key: string) => {
            removePromises.push(
                new Promise((resolve, reject) => {
                    try {
                        const res = this.remove(key);
                        resolve(res);
                    } catch (error) {
                        reject(error);
                    }
                })
            );
        });

        await Promise.all(removePromises);
    };

    async download(key: string): Promise<GetObjectCommandOutput> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            const response = await this.s3Client.send(command);
            return response;
        } catch (error) {
            console.error(error);
        }

    }
}
