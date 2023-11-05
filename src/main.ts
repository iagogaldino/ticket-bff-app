import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';

// Configurar opções CORS
const corsOptions = {
  origin: 'http://seusite.com', // Especifique a origem permitida
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  allowedHeaders: 'Content-Type, Authorization', // Cabeçalhos permitidos
};

async function bootstrap() {
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method == "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }

    next();
  });
  // Usar as opções CORS configuradas
  // app.use(cors(corsOptions));

  await app.listen(port);
}
bootstrap();
