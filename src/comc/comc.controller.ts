import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ComcService } from './comc.service';

@Controller('comc')
export class ComcController {
  constructor(private readonly comcService: ComcService) {}

  @Get('search')
  async search(
    @Query('year') year: string,
    @Query('playerName') playerName: string,
    @Query('cardNumber') cardNumber: string,
  ) {
    return this.comcService.searchSales(playerName, cardNumber, year);
  }

  @Post('sales')
  async sales(
    @Query('comcSetName') comcSetName: string,
    @Query('playerName') playerName: string,
    @Query('cardNumber') cardNumber: string,
    @Body('cookie') cookie: string,
  ) {
    return this.comcService.getSalesPrices(
      cookie,
      comcSetName,
      playerName,
      cardNumber,
    );
  }
}
