import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { UserTypes } from "@prisma/client";

export interface ITenant {
    email: string;
    id: string;
    type: UserTypes;
    created_at: Date;
}

export const Tenant = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
})