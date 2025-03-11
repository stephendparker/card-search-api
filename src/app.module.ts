import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EbayService } from './ebay/ebay.service';
import { EbayController } from './ebay/ebay.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './cards/card.entity';
import { CardsService } from './cards/cards.service';
import { CardsController } from './cards/cards.controller';
import { SCPService } from './scp/scp.service';
import { SCPController } from './scp/scp.controller';
import { ComcService } from './comc/comc.service';
import { ComcController } from './comc/comc.controller';
import { ComcSalePrices } from './comc/comc-sales-prices.entity';
import { DealsController } from './deals/deals.controller';
import { EbaySearchResult } from './ebay/ebay-search-result.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([EbaySearchResult, ComcSalePrices, Card]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Card, ComcSalePrices, EbaySearchResult],
        synchronize: true, // Set to false in production
      }),
    }),
  ],
  controllers: [
    AppController,
    EbayController,
    CardsController,
    SCPController,
    ComcController,
    DealsController,
  ],
  providers: [AppService, EbayService, CardsService, SCPService, ComcService],
})
export class AppModule {}
