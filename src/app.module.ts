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
          type: 'sqlite',
          database: configService.get<string>('DB_NAME'),
          entities: [User, Report],
          synchronize: true,
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
  // THIS WILL BE CALLED AUTOMATICALLY WHENEVER THE APP START LISTENING FOR INCOMING TRAFFIC
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['asdasdasdsa'],
        }),
      )
      .forRoutes('*'); // USE THE cookieSession middleware ON EVERY ROUTE
  }
}
