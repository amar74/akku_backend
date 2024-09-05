import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

export interface IWithTransactionClient { prisma?: Prisma.TransactionClient };
export interface ITransferEmployees { source_id: string, target_id: string };

export interface ApiResponse { success: boolean; message?: string; data?: any }
export interface PaginatedResponse extends ApiResponse {
    page: number;
    page_size: number;
    total: number;
}

@Injectable()
export class PrismaService extends PrismaClient {
    
}
