import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())

  const configService: ConfigService = app.get(ConfigService)
  const PORT = parseInt(configService.get("PORT"), 10)
  
  await app.listen(PORT);
}
bootstrap();
