FROM node:20

# intsall redis server
RUN apt update && apt-get install redis -y

WORKDIR /var/www/api

# installing pnpm
RUN npm install -g pnpm

COPY package*.json ./

RUN pnpm install

COPY . .

# generate prisma types
RUN npx prisma generate --schema=./prisma/schema.prisma


EXPOSE 4000

# finally run the redis-server and application
CMD redis-server --daemonize yes  && pnpm run build && pnpm run start