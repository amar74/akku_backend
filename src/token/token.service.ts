import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { TOKENS, TOKEN_EXPIRATIONS } from '../../lib/constants';
import { IWithTransactionClient, PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';


interface IBlacklistToken extends IWithTransactionClient {
    token: string;
    iat: number;
    exp: number;
}
interface IFindToken extends IWithTransactionClient { token: string }


@Injectable()
export class TokenService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    verifyToken(token: string) {
        return jwt.verify(token, process.env.SECRET_KEY);
    }

    generateToken(payload: any, options?: jwt.SignOptions) {
        return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: TOKEN_EXPIRATIONS[TOKENS.auth_token], ...(options && options) });
    }

    getRefreshPayload(refresh_token: string, id: string) {
        const payload: any = this.verifyToken(refresh_token);
        if (payload.type !== TOKENS.refresh_token) throw new UnauthorizedException({ success: false, message: "Refresh token is not valid." });
        if (payload.data.id !== id) throw new UnauthorizedException({ success: false, message: "Invalid user requesting refresh action." });
        return payload;
    }


    async findToken({ token, prisma }: IFindToken) {
        const PRISMA = prisma || this.prisma;
        return await PRISMA.token.findUnique({ where: { token } });
    }


    async blacklistToken({ token, iat, exp, prisma }: IBlacklistToken) {
        const PRISMA = prisma || this.prisma;

        try {
            const tkn = await this.findToken({ token, prisma: PRISMA });
            if (!tkn) {
                await this.prisma.token.create({
                    data: {
                        token,
                        iat,
                        exp
                    }
                })
            }
        } catch (error) {
            Logger.log("Error blacklisting token", "TokenService");
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanBlackListedTokens() {
        try {
            await this.prisma.token.deleteMany({
                where: {
                    exp: {
                        lte: Date.now()
                    }
                },
            })
        } catch (error) {
            Logger.log("Error while cleaning expired blacklisted tokens", "TokenService");
        }
    }
}
