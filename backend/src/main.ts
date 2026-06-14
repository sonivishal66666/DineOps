import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const logger = new Logger('Bootstrap');
const expressApp = express();
let nestApp: any;

async function bootstrap() {
  if (!nestApp) {
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    // Enable Cross-Origin Resource Sharing (CORS) for Next.js
    nestApp.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    
    await nestApp.init();
  }
  return expressApp;
}

// For local development
if (!process.env.VERCEL) {
  bootstrap().then(async () => {
    const port = process.env.PORT || 5000;
    await nestApp.listen(port);
    logger.log(`DineOps backend running locally on: http://localhost:${port}`);
  });
}

// Vercel Serverless Function entrypoint
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};
