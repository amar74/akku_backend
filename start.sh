#!/bin/bash
pnpm install
pnpm dlx prisma generate --schema=./prisma/schema.prisma
pnpm start:dev
