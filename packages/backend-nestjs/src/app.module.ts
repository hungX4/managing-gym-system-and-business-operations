import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { UserModule } from './modules/user/user.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { TrialLeadModule } from './modules/lead/lead.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingModule } from './modules/booking/booking.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { CheckinModule } from './modules/checkin/checkin.module';
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
          timezone: '+07:00',
          //dateStrings: true, //Trả về nguyên bản chuỗi "YYYY-MM-DD HH:mm:ss"
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false, // Giữ false để không đè nát DB cũ}

        }
      }
    }),
    UserModule,
    SubscriptionModule,
    TrialLeadModule,
    AuthModule,
    BookingModule,
    AttendanceModule,
    PayrollModule,
    CheckinModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
