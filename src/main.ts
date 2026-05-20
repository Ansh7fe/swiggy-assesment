import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend clients
  app.enableCors();

  // Bind global validation pipes for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Bind custom global Exception Filter to format all error payloads
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure Swagger OpenAPI interactive documentation
  const config = new DocumentBuilder()
    .setTitle('Swiggy Jira-Like Modular Monolith API')
    .setDescription(
      'A highly performant, robust NestJS backend for managing projects, agile issues, workflows, sprints, comments, search, and audit logs.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`🚀 Jira Monolith is running successfully on: http://localhost:${port}`);
  console.log(`📖 Interactive Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
