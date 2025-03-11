import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { CardsService } from 'src/cards/cards.service';
import { EbaySearchResult } from './ebay-search-result.entity';
import { Card } from 'src/cards/card.entity';

@Controller('ebay')
export class EbayController {
  constructor(
    private readonly ebayService: EbayService,
    private readonly cardsService: CardsService,
  ) {}

  @Post('search')
  async search(
    @Body('epids')
    epids: string[],
    @Body('limit') limit: number,
    @Body('daysLeft') daysLeft: string,
    @Body('maxPrice') maxPrice: string,
  ) {
    return this.ebayService.searchFootballCards(
      epids,
      limit,
      daysLeft === null ? null : parseInt(daysLeft),
      maxPrice === null ? null : parseInt(maxPrice),
    );
  }

  async updateDeals(cards: Card[], searchResults: Partial<EbaySearchResult>[]) {
    const ebayResultsMap = searchResults.reduce((map, item) => {
      if (!map.has(item.epid)) {
        map.set(item.epid, []);
      }
      map.get(item.epid)!.push(item);
      return map;
    }, new Map<string, Partial<EbaySearchResult>[]>());

    for (let x = 0; x < cards.length; x++) {
      const card = cards[x];

      const searchResults = ebayResultsMap.get(card.epid!);
      const newDealIds = searchResults?.map((sr) => sr.itemId) ?? [];

      const existingDeals =
        card.ebaySearchResults?.map((esr) => esr.itemId) ?? [];

      const removedDeals = existingDeals.filter(
        (edId) => !newDealIds.includes(edId),
      );
      const addedDeals =
        searchResults?.filter((sr) => !existingDeals.includes(sr.itemId)) ?? [];

      const updatedDeals =
        searchResults?.filter((sr) => existingDeals.includes(sr.itemId)) ?? [];

      console.log(
        'removing ' + removedDeals.length + ' for ' + card.playerName,
      );
      await this.ebayService.deleteDeals(card.id, removedDeals);
      console.log(
        'updating ' + updatedDeals.length + ' for ' + card.playerName,
      );
      await this.ebayService.updateDeals(card.id, updatedDeals);
      console.log('adding ' + addedDeals.length + ' for ' + card.playerName);
      await this.ebayService.create(addedDeals, card.id);
    }
  }

  @Post('loadAuctions')
  async loadAuctions(
    @Body('limit') limit: number,
    @Body('daysLeft') daysLeft: string,
    @Body('maxPrice') maxPrice: string,
  ) {
    const allCards = (await this.cardsService.findAll()).filter(
      (card) => card.epid && !card.owned && card.epid !== 'none',
    );
    console.log('searching ebay for card count = ' + allCards.length);

    const epids = allCards.map((card) => card.epid!);
    const searchResults = await this.ebayService.searchFootballCards(
      epids,
      limit,
      parseInt(daysLeft),
      maxPrice === null ? null : parseInt(maxPrice),
    );
    this.updateDeals(allCards, searchResults);
  }

  @Post('hideDeal')
  async hideDeal(@Query('id') id: number, @Query('hide') hide: number) {
    return this.ebayService.setDealHide(id, hide);
  }
}
