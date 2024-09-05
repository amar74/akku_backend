import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ValidationError } from 'class-validator';
import { JSONPayloadPipe } from './bucket/json-payload.pipe';
import { HttpExceptionFilter } from './app.exception-filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://akkukachasma.com',
  ];

  const allowedHeaders = [
    '*',
    'content-type',
    'authorization',
    'access-control-allow-origin',
    'branch_id',
  ];

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders,
    credentials: true,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  app.useGlobalPipes(
    new JSONPayloadPipe(),
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        try {
          if (validationErrors.length > 0) {
            const firstError = validationErrors?.[0];
            const constraints = Object.values(
              firstError?.constraints || firstError.children?.[0]?.constraints,
            )?.[0]; // Get the first constraint message
            return new BadRequestException({
              success: false,
              message: constraints,
            });
          }
        } catch (e) {
          return null; // No errors, return null to avoid unnecessary responses
        }
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Akku Ka Chasma')
    .setDescription('Api listing for the project - Akku ka chasma')
    .setVersion('0.0.1')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(4000, () => Logger.log(`server is running on PORT ${4000}`));
}
bootstrap();
