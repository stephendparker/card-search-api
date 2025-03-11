import { Controller, Get, Query } from '@nestjs/common';
import { SCPService } from './scp.service';

@Controller('scp')
export class SCPController {
  constructor(private readonly sportsCardProService: SCPService) {}

  @Get('search')
  async searchCards(@Query('query') query: string) {
    if (!query) {
      return { message: 'Query parameter is required' };
    }

    const data = await this.sportsCardProService.searchCard(query);
    return data;
  }

  @Get('details')
  async cardDetails(@Query('cardUrl') query: string) {
    if (!query) {
      return { message: 'Query parameter is required' };
    }

    const data = await this.sportsCardProService.loadCardDetails(query);
    return data;
  }
}
