import { Controller, Get, Post, Body } from '@nestjs/common';
import { CardsService } from './cards.service';
import { Card } from './card.entity';
import * as myData from '../data/hofrookie.json';
import { SCPService } from 'src/scp/scp.service';
import { ComcService } from 'src/comc/comc.service';
import { ComcSalePrices } from 'src/comc/comc-sales-prices.entity';

@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly scpService: SCPService,
    private readonly comcSalesPrices: ComcService,
  ) {}

  @Get()
  async findAll(): Promise<Card[]> {
    return this.cardsService.findAll();
  }

  @Post()
  async createCard(
    @Body() createCardDto: { name: string; cardNumber: string; year: number },
  ): Promise<Card> {
    return this.cardsService.createCard(
      createCardDto.name,
      createCardDto.cardNumber,
      createCardDto.year,
    );
  }

  @Post('list')
  async createCards(
    @Body()
    createCardDtos: { issue: string; cardNumber: string; year: number }[],
  ): Promise<Card[]> {
    return this.cardsService.createCards(createCardDtos);
  }

  @Get('manual')
  async search(): Promise<Card[]> {
    return myData.map((favorite: { issue: string; cardNumber: string }) => {
      const retVal: Card = new Card();
      const issueParts = favorite.issue.split(' ');
      retVal.issue = favorite.issue;
      retVal.cardNumber = favorite.cardNumber;
      retVal.year = parseInt(issueParts[0], 10);
      return retVal;
    });
  }

  @Post('update')
  async update(
    @Body('issue') issue: string,
    @Body('scpUrl') scpUrl: string | null,
    @Body('comcSetName') comcSetName: string | null,
  ): Promise<Card> {
    return this.cardsService.updateByIssue({
      issue,
      scpUrl,
      comcSetName,
    });
  }

  @Post('refreshAllScpData')
  async refreshAllSpcCardData(): Promise<Card[]> {
    const cards = await this.cardsService.findAll();

    for (let x = 0; x < cards.length; x++) {
      const card = cards[x];
      await this.refreshSpcCardData(card.issue);
    }

    return this.cardsService.findAll();
  }

  @Post('updateComcPrices')
  async updateComcPrices(
    @Body('issue') issue: string,
    @Body('comcSalePrices') comcSalePrices: ComcSalePrices,
  ): Promise<Card> {
    console.log('issue' + issue);
    console.log('comcSalePrices' + JSON.stringify(comcSalePrices));
    const card = await this.cardsService.findByIssue(issue);

    if (card.comcSalePrices) {
      console.log('sales already exists');
    } else {
      console.log('no sales prices');
    }

    const updatedComcSalesPrices = Object.assign(
      card.comcSalePrices ?? new ComcSalePrices(),
      {
        ...comcSalePrices,
        card: card,
        id: card.comcSalePrices?.id ?? null,
      },
    );
    card.comcSalePrices = updatedComcSalesPrices;
    await this.comcSalesPrices.createOrUpdateComcSalePrices(
      updatedComcSalesPrices,
    );

    // await this.cardsService.update(card);
    console.log('returning');
    return this.cardsService.findByIssue('issue');
  }

  @Post('updateOwned')
  async updateOwned(
    @Body('issue') issue: string,
    @Body('owned') owned: boolean,
  ): Promise<Card> {
    this.cardsService.updateByIssue({ issue, owned });
    return this.cardsService.findByIssue('issue');
  }

  @Post('refreshScpData')
  async refreshSpcCardData(@Body('issue') issue: string): Promise<Card> {
    const card = await this.cardsService.findByIssue(issue);
    console.log('refreshScpData found card: ' + JSON.stringify(card));

    const cardDetails = !card.scpUrl
      ? {}
      : await this.scpService.loadCardDetails(card.scpUrl);

    console.log('cardDetails: ' + JSON.stringify(cardDetails));

    const updatedCard = {
      issue,
      ...card,
      ...cardDetails,
    };

    console.log('updatedCard: ' + JSON.stringify(updatedCard));

    return this.cardsService.updateByIssue(updatedCard);
  }
}
