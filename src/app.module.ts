import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    // Get access to the ConfigService (Make env available in the app) through dependencies injection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get<any>('DB_TYPE'),
          host: configService.get<string>('DB_LOCALHOST'),
          port: configService.get<number>('DB_PORT'),
          password: configService.get<string>('DB_PASSWORD'),
          username: configService.get<string>('DB_USERNAME'),
          database: configService.get<string>('DB_NAME'),
          entities: [User, Report],
          synchronize: true,
          logging: true,
        };
      },
    }),
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // GLOBAL PIPE
    {
      provide: APP_PIPE, // We can use this to set the pipe on the entire app OR WHEN WE CREATE AN INSTANCE OF APP MODULE

      // APPLY THIS TO EVERY REQUEST THAT COMES FROM THE APP (APP_PIPE)
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private ConfigService: ConfigService) {}
  // THIS WILL BE CALLED AUTOMATICALLY WHENEVER THE APP START LISTENING FOR INCOMING TRAFFIC
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.ConfigService.get('COOKIE_KEY')], // used to encrypt our cookie
        }),
      )
      .forRoutes('*'); // USE THE cookieSession middleware ON EVERY ROUTE
  }
}
