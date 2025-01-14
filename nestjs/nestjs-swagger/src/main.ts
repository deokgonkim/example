import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const VERSION = process.env.npm_package_version;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerPath = 'doc';
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Swagger')
    .setDescription('Testing nestjs with swagger')
    .setVersion(VERSION)
    .addTag('tag1')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
