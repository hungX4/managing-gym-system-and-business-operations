import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
@Module({
  imports: [
    // chỉ định đường dẫn tới file .env của Express cũ
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        //file .env bên thư mục express cũ
        path.resolve(__dirname, '../../backend/.env')
      ],
    }),
    TypeOrmModule.forRootAsync({

      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('================ [CHECK ENV] ================');
        console.log('DB_HOST từ env:', config.get('DB_HOST'));
        console.log('DB_NAME từ env:', config.get('DB_NAME'));
        console.log('=============================================');
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,

          synchronize: false, // Giữ false để không đè nát DB cũ}

        }
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
